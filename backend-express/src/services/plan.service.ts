import { shopify } from "@/config/shopify.config";
import { ERROR_MESSAGES, PLAN_DEFAULTS, PlanType, SubscriptionStatus } from "@/constants";
import {
    CANCEL_SUBSCRIPTION_MUTATION,
    GET_ALL_SUBSCRIPTIONS_QUERY,
    GET_CHARGE_HISTORY_QUERY,
    GET_SUBSCRIPTION_QUERY,
} from "@/graphql/billing-queries";
import type { IMerchantRepository, IMerchantService, IPlanRepository } from "@/interfaces";
import type { IPlanService } from "@/interfaces";
import { TYPES } from "@/types";
import type { IPlan, IPlanFeatures, MerchantDocument, PlanDocument } from "@/types";
import { logger } from "@/utils/logger";
import { env } from "@/validations/env.validation";
import { inject, injectable } from "inversify";
import mongoose from "mongoose";

@injectable()
export class PlanService implements IPlanService {
    private readonly defaultFreeFeatures: IPlanFeatures = {
        quoteLimit: PLAN_DEFAULTS.FREE.QUOTE_LIMIT,
        removeBranding: PLAN_DEFAULTS.FREE.REMOVE_BRANDING,
        emailNotifications: PLAN_DEFAULTS.FREE.EMAIL_NOTIFICATIONS,
    };

    private readonly defaultProFeatures: IPlanFeatures = {
        quoteLimit: PLAN_DEFAULTS.PRO.QUOTE_LIMIT,
        removeBranding: PLAN_DEFAULTS.PRO.REMOVE_BRANDING,
        emailNotifications: PLAN_DEFAULTS.PRO.EMAIL_NOTIFICATIONS,
    };

    constructor(
        @inject(TYPES.IPlanRepository) private planRepository: IPlanRepository,
        @inject(TYPES.IMerchantService) private merchantService: IMerchantService,
    ) {}

    async getPlanByName(name: string): Promise<PlanDocument | null> {
        return await this.planRepository.findByName(name);
    }

    async getPlanById(id: string): Promise<PlanDocument | null> {
        return await this.planRepository.findById(id);
    }

    async getAllPlans(): Promise<PlanDocument[]> {
        return await this.planRepository.findAll();
    }

    async createPlan(planData: Partial<IPlan>): Promise<PlanDocument> {
        return await this.planRepository.create(planData);
    }

    async getMerchantPlan(shop: string): Promise<PlanDocument | null> {
        const merchant = await this.merchantService.getMerchantByShop(shop);
        if (!merchant) return null;

        if (merchant.planId) {
            return await this.planRepository.findById(merchant.planId.toString());
        }

        return await this.getPlanByName(PlanType.FREE);
    }

    async checkQuoteLimit(shop: string): Promise<{ allowed: boolean; message?: string }> {
        const merchant = await this.merchantService.getMerchantByShop(shop);
        if (!merchant) {
            return { allowed: false, message: ERROR_MESSAGES.MERCHANT.NOT_FOUND };
        }

        let plan: PlanDocument | null = null;
        if (merchant.planId) {
            plan = await this.planRepository.findById(merchant.planId.toString());
        }

        const quoteLimit =
            plan?.quoteLimit ??
            (plan?.name === PlanType.PRO ? this.defaultProFeatures.quoteLimit : this.defaultFreeFeatures.quoteLimit);
        const currentUsage = merchant.usage?.quotesUsed || 0;

        if (currentUsage >= quoteLimit) {
            const planName = plan?.name || PlanType.FREE;
            return {
                allowed: false,
                message: ERROR_MESSAGES.PLAN.LIMIT_REACHED(planName, quoteLimit),
            };
        }

        return { allowed: true };
    }

    async getQuoteLimit(shop: string): Promise<number> {
        const plan = await this.getMerchantPlan(shop);
        return plan?.quoteLimit ?? this.defaultFreeFeatures.quoteLimit;
    }

    async hasFeature(shop: string, feature: keyof IPlanFeatures): Promise<boolean> {
        const plan = await this.getMerchantPlan(shop);

        // If it's a direct property on the plan (like permissions check)
        if (feature === "removeBranding" || feature === "emailNotifications") {
            // Check if plan exists and has permissions or features (adjusting for schema)
            // Currently our schema has permissions array.
            const hasPermission = plan?.permissions?.includes(feature.toUpperCase());
            if (hasPermission) return true;

            // Fallback to defaults based on name
            const defaults = plan?.name === PlanType.PRO ? this.defaultProFeatures : this.defaultFreeFeatures;
            return !!defaults[feature];
        }

        return false;
    }

    async createSubscription(session: unknown, planName: string, host: string): Promise<string> {
        // We're switching to "Managed Billing". The controller handles the redirect now.
        // This method is kept for legacy compatibility but can be removed once controller is fully migrated.
        const confirmationUrl = await shopify.api.billing.request({
            session,
            plan: planName,
            isTest: env.NODE_ENV !== "production",
            returnUrl: `https://${env.HOST_NAME}/api/plans/callback?shop=${session.shop}&plan=${planName}`,
        });
        return confirmationUrl;
    }

    async verifyReinstallationBilling(
        session: unknown,
    ): Promise<{ planId?: unknown; subscriptionStatus?: SubscriptionStatus }> {
        try {
            const client = new shopify.api.clients.Graphql({ session });
            const billingResponse: unknown = await (client as unknown).request(GET_ALL_SUBSCRIPTIONS_QUERY);

            const edges = billingResponse.body?.data?.currentAppInstallation?.allSubscriptions?.edges || [];
            const lastSub = edges[0]?.node;

            if (!lastSub) return {};

            const status = lastSub.status.toUpperCase();
            const periodEnd = lastSub.currentPeriodEnd ? new Date(lastSub.currentPeriodEnd) : null;
            const now = new Date();

            if (status === "ACTIVE" || (status === "CANCELLED" && periodEnd && now < periodEnd)) {
                const planDoc = await this.planRepository.findByName(lastSub.name);
                if (planDoc) {
                    return { planId: planDoc._id, subscriptionStatus: SubscriptionStatus.ACTIVE };
                }
            }

            if (status === "FROZEN") {
                return { subscriptionStatus: SubscriptionStatus.FROZEN };
            }

            const freePlan = await this.planRepository.findByName(PlanType.FREE);
            return { planId: freePlan?._id, subscriptionStatus: SubscriptionStatus.CANCELLED };
        } catch (billingErr) {
            logger.warn(`PlanService: Failed verifyReinstallationBilling for ${session.shop}: ${billingErr}`);
        }
        return {};
    }

    async handleSubscriptionUpdate(shop: string, subscriptionId: string): Promise<void> {
        const merchant = await this.merchantService.getMerchantByShop(shop);
        if (!merchant) {
            logger.warn(`PlanService: No merchant found for ${shop} during webhook`);
            return;
        }

        const session = await shopify.api.session.getOfflineId(shop);
        const offlineSession = await shopify.config.sessionStorage.loadSession(session!);
        if (!offlineSession) {
            logger.error(`PlanService: No offline session for ${shop}`);
            return;
        }

        try {
            const client = new shopify.api.clients.Graphql({ session: offlineSession });
            const response: unknown = await (client as unknown).request(GET_SUBSCRIPTION_QUERY, {
                variables: { id: `gid://shopify/AppSubscription/${subscriptionId}` },
            });

            const subDetails = response.body?.data?.node || response.data?.node;
            if (!subDetails) return;

            const status = subDetails.status.toUpperCase();
            const periodEnd = subDetails.currentPeriodEnd ? new Date(subDetails.currentPeriodEnd) : null;
            const now = new Date();
            const planDoc = await this.planRepository.findByName(subDetails.name);

            // Logic: ACTIVE or CANCELLED-but-within-period => PRO features active
            const isActuallyActive = status === "ACTIVE" || (status === "CANCELLED" && periodEnd && now < periodEnd);

            if (isActuallyActive && planDoc) {
                await this.updateMerchantStatus(shop, planDoc._id, SubscriptionStatus.ACTIVE);
            } else {
                const freePlan = await this.planRepository.findByName(PlanType.FREE);
                await this.updateMerchantStatus(shop, freePlan?._id, SubscriptionStatus.CANCELLED);
            }
        } catch (err: unknown) {
            logger.error(`PlanService: handleSubscriptionUpdate failed: ${err.message}`);
        }
    }

    async handleCallback(shop: string, charge_id?: string, plan?: string, host?: string): Promise<string> {
        if (!shop) throw new Error("Missing shop parameter");

        const redirectParams = new URLSearchParams({ shop });
        if (host) redirectParams.set("host", host);

        try {
            if (charge_id && plan) {
                await this.processPaidPlanCallback(shop, charge_id, plan, redirectParams);
            } else if (plan === "FREE") {
                await this.processFreePlanCallback(shop, redirectParams);
            }
        } catch (err: unknown) {
            logger.error(`[PlanService] handleCallback failed: ${err.message}`);
            redirectParams.set("billing", "error");
        }

        const appUrl = `https://${env.HOST_NAME}/plans?${redirectParams.toString()}`;
        logger.info(`[PlanService] handleCallback -> ${appUrl}`);
        return appUrl;
    }

    /**
     * PRIVATE HELPERS TO REDUCE COMPLEXITY
     */

    private async processPaidPlanCallback(shop: string, chargeId: string, planName: string, params: URLSearchParams) {
        const session = await this.getShopSession(shop);
        let verified = true; // Fallback if session missing

        if (session) {
            verified = await this.verifyChargeStatus(session, chargeId);
        }

        if (!verified) {
            logger.warn(`PlanService: Charge ${chargeId} not active for ${shop}. Skipping update.`);
            return;
        }

        const planDoc = await this.getPlanByName(planName);
        if (planDoc) {
            await this.updateMerchantStatus(shop, planDoc._id, SubscriptionStatus.ACTIVE);
            params.set("billing", "success");
        }
    }

    private async processFreePlanCallback(shop: string, params: URLSearchParams) {
        const session = await this.getShopSession(shop);

        if (session) {
            await this.cancelAllActiveSubscriptions(session, shop);
        }

        const planDoc = await this.getPlanByName("FREE");
        if (planDoc) {
            await this.updateMerchantStatus(shop, planDoc._id, SubscriptionStatus.CANCELLED);
            params.set("billing", "success");
        }
    }

    private async verifyChargeStatus(session: unknown, chargeId: string): Promise<boolean> {
        try {
            const client = new shopify.api.clients.Graphql({ session });
            const response: unknown = await (client as unknown).request(GET_SUBSCRIPTION_QUERY, {
                variables: { id: `gid://shopify/AppSubscription/${chargeId}` },
            });

            const status = response.body?.data?.node?.status || response.data?.node?.status;
            return status?.toUpperCase() === "ACTIVE";
        } catch (err) {
            return true; // Default to true on network error to avoid locking merchant out
        }
    }

    private async cancelAllActiveSubscriptions(session: unknown, shop: string) {
        const client = new shopify.api.clients.Graphql({ session });
        const allSubsRes: unknown = await (client as unknown).request(GET_ALL_SUBSCRIPTIONS_QUERY);
        const activeSub = allSubsRes.body?.data?.currentAppInstallation?.allSubscriptions?.edges?.[0]?.node;

        if (activeSub?.status?.toUpperCase() === "ACTIVE") {
            logger.info(`[PlanService] Cancelling active subscription: ${activeSub.name} for ${shop}`);
            await (client as unknown).request(CANCEL_SUBSCRIPTION_MUTATION, {
                variables: { id: activeSub.id },
            });
        }
    }

    private async updateMerchantStatus(shop: string, planId: unknown, status: SubscriptionStatus) {
        await this.merchantService.createOrUpdateMerchant({
            shop,
            planId,
            subscriptionStatus: status,
        });
    }

    private async getShopSession(shop: string) {
        const sessions = await shopify.config.sessionStorage!.findSessionsByShop(shop);
        return sessions?.[0];
    }

    async getChargeHistory(session: unknown): Promise<unknown> {
        try {
            const client = new shopify.api.clients.Graphql({ session });
            const response: unknown = await (client as unknown).request(GET_CHARGE_HISTORY_QUERY);

            const data = response?.data || response?.body?.data;
            const subscriptions = data?.currentAppInstallation?.allSubscriptions?.edges || [];
            const oneTimePurchases = data?.currentAppInstallation?.oneTimePurchases?.edges || [];

            return {
                subscriptions: subscriptions.map((edge: unknown) => edge.node),
                oneTimePurchases: oneTimePurchases.map((edge: unknown) => edge.node),
            };
        } catch (error: unknown) {
            logger.error(`PlanService: Error getChargeHistory: ${error.message}`);
        }
    }
}
