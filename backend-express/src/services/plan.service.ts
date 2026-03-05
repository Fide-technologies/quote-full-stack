import { injectable, inject } from "inversify";
import { TYPES } from "@/types";
import type { IPlanRepository, IMerchantRepository, IMerchantService } from "@/interfaces";
import type { IPlanService } from "@/interfaces";
import type { PlanDocument, IPlan, IPlanFeatures, MerchantDocument } from "@/types";
import { PlanType, PLAN_DEFAULTS, ERROR_MESSAGES } from "@/constants";
import { shopify } from "@/config/shopify.config";
import { env } from "@/validations/env.validation";
import { logger } from "@/utils/logger";

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

    async createSubscription(session: any, planName: string): Promise<string> {
        const plan = await this.getPlanByName(planName);
        if (!plan) {
            throw new Error(`Plan ${planName} not found`);
        }

        const returnUrl = `https://${env.HOST_NAME}/api/plans/callback?shop=${session.shop}&plan=${planName}`;

        if (planName === "FREE") {
            return returnUrl;
        }

        const client = new shopify.api.clients.Graphql({ session });
        const response = await client.request(`
            mutation AppSubscriptionCreate($name: String!, $returnUrl: URL!, $lineItems: [AppSubscriptionLineItemInput!]!, $test: Boolean, $trialDays: Int) {
                appSubscriptionCreate(name: $name, returnUrl: $returnUrl, lineItems: $lineItems, test: $test, trialDays: $trialDays) {
                    userErrors {
                        field
                        message
                    }
                    confirmationUrl
                    appSubscription {
                        id
                    }
                }
            }
        `, {
            variables: {
                name: plan.name,
                returnUrl,
                test: true,
                trialDays: plan.trialDays || 0,
                lineItems: [{
                    plan: {
                        appRecurringPricingDetails: {
                            price: { amount: parseFloat(plan.price.toString()), currencyCode: "USD" },
                            interval: "EVERY_30_DAYS"
                        }
                    }
                }]
            }
        });

        if (response.data?.appSubscriptionCreate?.userErrors?.length > 0) {
            const errors = response.data.appSubscriptionCreate.userErrors;
            const errorMessages = errors.map((e: any) => e.message).join(", ");
            console.log("error in the backend is: ", errorMessages);

            throw new Error(errors[0].message);
        }


        return response.data?.appSubscriptionCreate?.confirmationUrl;
    }

    async handleCallback(shop: string, charge_id?: string, plan?: string): Promise<string> {
        if (!shop) {
            throw new Error("Missing shop parameter");
        }

        // Only update DB if they approved the charge (indicated by charge_id)
        if (charge_id && plan) {
            logger.info(`Processing billing approval for ${shop}: Plan=${plan}, ChargeId=${charge_id}`);

            const planDoc = await this.getPlanByName(plan);
            if (planDoc) {
                await this.merchantService.createOrUpdateMerchant({
                    shop,
                    planId: planDoc._id
                });
                logger.info(`Successfully upgraded ${shop} to ${planDoc.name}`);
            } else {
                logger.error(`Billing Callback: Plan ${plan} not found in database.`);
            }
        } else if (!charge_id && plan !== "FREE") {
            logger.warn(`Billing Callback: User potentially declined or cancelled plan ${plan} for ${shop}`);
        } else if (plan === "FREE") {
            // Handle direct downgrade to FREE
            const planDoc = await this.getPlanByName("FREE");
            if (planDoc) {
                await this.merchantService.createOrUpdateMerchant({
                    shop,
                    planId: planDoc._id
                });
                logger.info(`Merchant ${shop} downgraded to FREE.`);
            }
        }

        const appUrl = `https://${shop}/admin/apps/${env.SHOPIFY_API_KEY}/plans`;
        logger.info(`Generated redirect URL for ${shop}: ${appUrl}`);

        return appUrl;
    }
}
