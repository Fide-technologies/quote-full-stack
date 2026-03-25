import { injectable, inject } from "inversify";
import { TYPES } from "@/types";
import type { IPlanRepository, IMerchantRepository, IMerchantService } from "@/interfaces";
import type { IPlanService } from "@/interfaces";
import type { PlanDocument, IPlan, IPlanFeatures, MerchantDocument } from "@/types";
import { PlanType, PLAN_DEFAULTS, ERROR_MESSAGES, SubscriptionStatus } from "@/constants";
import { shopify } from "@/config/shopify.config";
import { env } from "@/validations/env.validation";
import { logger } from "@/utils/logger";
import { GET_SUBSCRIPTION_QUERY, GET_ALL_SUBSCRIPTIONS_QUERY } from "@/graphql/billing-queries";
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
        @inject(TYPES.IMerchantService) private merchantService: IMerchantService
    ) { }

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

        const quoteLimit = plan?.quoteLimit ?? (plan?.name === PlanType.PRO ? this.defaultProFeatures.quoteLimit : this.defaultFreeFeatures.quoteLimit);
        const currentUsage = merchant.usage?.quotesUsed || 0;

        if (currentUsage >= quoteLimit) {
            const planName = plan?.name || PlanType.FREE;
            return {
                allowed: false,
                message: ERROR_MESSAGES.PLAN.LIMIT_REACHED(planName, quoteLimit)
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
        if (feature === 'removeBranding' || feature === 'emailNotifications') {
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

    async createSubscription(session: any, planName: string, host: string): Promise<string> {
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

    async verifyReinstallationBilling(session: any): Promise<{ planId?: any; subscriptionStatus?: SubscriptionStatus }> {
        try {
            const client = new shopify.api.clients.Graphql({ session });
            const billingResponse: any = await (client as any).request(GET_ALL_SUBSCRIPTIONS_QUERY);

            const edges = billingResponse.body?.data?.currentAppInstallation?.allSubscriptions?.edges || [];
            const lastSub = edges[0]?.node;

            if (lastSub) {
                const status = lastSub.status.toUpperCase();
                const periodEnd = lastSub.currentPeriodEnd ? new Date(lastSub.currentPeriodEnd) : null;
                const now = new Date();

                if (status === "ACTIVE" || (status === "CANCELLED" && periodEnd && now < periodEnd)) {
                    const planDoc = await this.planRepository.findByName(lastSub.name);
                    if (planDoc) {
                        return { 
                            planId: planDoc._id, 
                            subscriptionStatus: SubscriptionStatus.ACTIVE 
                        };
                    }
                } else if (status === "FROZEN") {
                    return { subscriptionStatus: SubscriptionStatus.FROZEN };
                } else {
                    const freePlan = await this.planRepository.findByName(PlanType.FREE);
                    return { 
                        planId: freePlan?._id, 
                        subscriptionStatus: SubscriptionStatus.CANCELLED 
                    };
                }
            }
        } catch (billingErr) {
            logger.warn(`PlanService: Failed to fetch billing status for ${session.shop}: ${billingErr}`);
        }
        return {};
    }

    async handleSubscriptionUpdate(shop: string, subscriptionId: string): Promise<void> {
        const merchant = await this.merchantService.getMerchantByShop(shop);
        if (!merchant) {
            logger.warn(`PlanService: No merchant found for ${shop} during webhook handling`);
            return;
        }

        const session = await shopify.api.session.getOfflineId(shop);
        const offlineSession = await shopify.config.sessionStorage.loadSession(session!);
        if (!offlineSession) {
            logger.error(`PlanService: Could not load offline session for ${shop}`);
            return;
        }

        const client = new shopify.api.clients.Graphql({ session: offlineSession });
        const response: any = await (client as any).request(GET_SUBSCRIPTION_QUERY, {
            variables: { id: `gid://shopify/AppSubscription/${subscriptionId}` }
        });

        const subDetails = response.body?.data?.node || response.data?.node;
        if (!subDetails) {
            logger.warn(`PlanService: No subscription data found for ${subscriptionId}`);
            return;
        }

        const status = subDetails.status.toUpperCase();
        const periodEnd = subDetails.currentPeriodEnd ? new Date(subDetails.currentPeriodEnd) : null;
        const now = new Date();
        const planDoc = await this.planRepository.findByName(subDetails.name);

        if (status === "ACTIVE") {
            if (planDoc) {
                await this.merchantService.createOrUpdateMerchant({
                    shop,
                    planId: planDoc._id,
                    subscriptionStatus: SubscriptionStatus.ACTIVE
                });
            }
        } else if (status === "CANCELLED" && periodEnd && now < periodEnd) {
            if (planDoc) {
                await this.merchantService.createOrUpdateMerchant({
                    shop,
                    planId: planDoc._id,
                    subscriptionStatus: SubscriptionStatus.ACTIVE
                });
            }
        } else {
            const freePlan = await this.planRepository.findByName(PlanType.FREE);
            await this.merchantService.createOrUpdateMerchant({
                shop,
                planId: freePlan?._id,
                subscriptionStatus: SubscriptionStatus.CANCELLED
            });
        }
    }

    async handleCallback(
        shop: string,
        charge_id?: string,
        plan?: string,
        host?: string
    ): Promise<string> {
        if (!shop) throw new Error("Missing shop parameter");

        // Build the base redirect URL back to our own app SPA.
        // This is CRITICAL: we cannot redirect to admin.shopify.com because the browser
        // would load outside the iframe causing App Bridge to fail (blank page + JS errors).
        const redirectParams = new URLSearchParams({ shop });
        if (host) redirectParams.set('host', host);

        // In development, include the ngrok bypass param on the FINAL /plans URL too.
        // The callback URL already has it, but when Express redirects to /plans,
        // that second ngrok hop has no param → ngrok shows its interstitial again.
        // Adding it here ensures the entire redirect chain bypasses ngrok's interstitial.
        if (env.NODE_ENV !== 'production') {
            redirectParams.set('ngrok-skip-browser-warning', 'true');
        }

        if (charge_id && plan) {
            try {
                // IMPORTANT: Verify the charge is actually ACTIVE via Shopify Admin API
                // before saving to DB. Do NOT trust the redirect alone — chargebacks/cancels
                // can still hit this URL. We verify using the session from session storage.
                const sessions = await shopify.config.sessionStorage!.findSessionsByShop(shop);
                const session = sessions?.[0];

                let chargeVerified = false;

                if (session) {
                    try {
                        const client = new shopify.api.clients.Graphql({ session });
                        const verifyResponse: any = await (client as any).request(GET_SUBSCRIPTION_QUERY, {
                            variables: { id: `gid://shopify/AppSubscription/${charge_id}` }
                        });

                        const status = verifyResponse.body?.data?.node?.status || verifyResponse.data?.node?.status;
                        logger.info(`[PlanService] Charge ${charge_id} status: ${status}`);

                        if (status === 'ACTIVE' || status === 'active') {
                            chargeVerified = true;
                        } else {
                            logger.warn(`[PlanService] Charge ${charge_id} is not ACTIVE (status=${status}). Not upgrading plan.`);
                        }
                    } catch (verifyErr: any) {
                        logger.warn(`[PlanService] Could not verify charge (non-fatal): ${verifyErr.message}`);
                        // Fall back to trusting the redirect — this handles edge cases where
                        // verification fails due to network issues but charge IS valid
                        chargeVerified = true;
                    }
                } else {
                    logger.warn(`[PlanService] No session found for ${shop} — trusting redirect`);
                    chargeVerified = true;
                }

                if (chargeVerified) {
                    const planDoc = await this.getPlanByName(plan);
                    if (planDoc) {
                        await this.merchantService.createOrUpdateMerchant({
                            shop,
                            planId: planDoc._id,
                            subscriptionStatus: SubscriptionStatus.ACTIVE
                        });
                        logger.info(`[PlanService] ✓ Upgraded ${shop} to ${planDoc.name} (charge_id=${charge_id})`);
                        redirectParams.set('billing', 'success');
                    } else {
                        logger.warn(`[PlanService] Plan '${plan}' not found in DB`);
                    }
                }
            } catch (err: any) {
                logger.error(`[PlanService] handleCallback DB update failed: ${err.message}`);
            }
        } else if (!charge_id && plan === 'FREE') {
            // Handle downgrade to FREE plan (no charge involved)
            const planDoc = await this.getPlanByName('FREE');
            if (planDoc) {
                await this.merchantService.createOrUpdateMerchant({ 
                    shop, 
                    planId: planDoc._id,
                    subscriptionStatus: SubscriptionStatus.ACTIVE 
                });
                logger.info(`[PlanService] ✓ ${shop} set to FREE plan`);
                redirectParams.set('billing', 'success');
            }
        }

        const appUrl = `https://${env.HOST_NAME}/plans?${redirectParams.toString()}`;
        logger.info(`[PlanService] handleCallback -> ${appUrl}`);
        return appUrl;
    }
}
