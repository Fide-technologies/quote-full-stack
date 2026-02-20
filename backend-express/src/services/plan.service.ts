import { injectable, inject } from "inversify";
import { TYPES } from "@/types";
import type { IPlanRepository, IMerchantRepository } from "@/interfaces";
import type { IPlanService } from "@/interfaces";
import type { PlanDocument, IPlan, IPlanFeatures, MerchantDocument } from "@/types";
import { PlanType, PLAN_DEFAULTS, ERROR_MESSAGES } from "@/constants";
import { shopify } from "@/config/shopify.config";
import { env } from "@/validations/env.validation";

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
        @inject(TYPES.IMerchantRepository) private merchantRepository: IMerchantRepository
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
        const merchant = await this.merchantRepository.findMerchantByShop(shop);
        if (!merchant) return null;

        if (merchant.planId) {
            return await this.planRepository.findById(merchant.planId.toString());
        }

        return await this.getPlanByName(PlanType.FREE);
    }

    async checkQuoteLimit(shop: string): Promise<{ allowed: boolean; message?: string }> {
        const merchant = await this.merchantRepository.findMerchantByShop(shop);
        if (!merchant) {
            return { allowed: false, message: ERROR_MESSAGES.MERCHANT.NOT_FOUND };
        }

        let plan: PlanDocument | null = null;
        if (merchant.planId) {
            plan = await this.planRepository.findById(merchant.planId.toString());
        }

        const features = plan?.features || (plan?.name === PlanType.PRO ? this.defaultProFeatures : this.defaultFreeFeatures);
        const currentUsage = merchant.usage?.quotesUsed || 0;

        if (currentUsage >= features.quoteLimit) {
            const planName = plan?.name || PlanType.FREE;
            return {
                allowed: false,
                message: ERROR_MESSAGES.PLAN.LIMIT_REACHED(planName, features.quoteLimit)
            };
        }

        return { allowed: true };
    }

    async getQuoteLimit(shop: string): Promise<number> {
        const plan = await this.getMerchantPlan(shop);
        const features = plan?.features || this.defaultFreeFeatures;
        return features.quoteLimit;
    }

    async hasFeature(shop: string, feature: keyof IPlanFeatures): Promise<boolean> {
        const plan = await this.getMerchantPlan(shop);
        const features = plan?.features || (plan?.name === PlanType.PRO ? this.defaultProFeatures : this.defaultFreeFeatures);

        const value = features[feature];
        if (typeof value === 'boolean') {
            return value;
        }

        return !!value;
    }

    async createSubscription(session: any, planName: string): Promise<string> {
        const plan = await this.getPlanByName(planName);
        if (!plan) {
            throw new Error(`Plan ${planName} not found`);
        }

        const returnUrl = `https://${env.HOST_NAME}/api/plans/callback?shop=${session.shop}&plan=${planName}`;

        const client = new shopify.api.clients.Graphql({ session });
        const response = await client.request(`
            mutation AppSubscriptionCreate($name: String!, $returnUrl: URL!, $lineItems: [AppSubscriptionLineItemInput!]!, $test: Boolean) {
                appSubscriptionCreate(name: $name, returnUrl: $returnUrl, lineItems: $lineItems, test: $test) {
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

            // Check if the error is due to Custom App billing restriction
            if (errorMessages.includes("Custom apps cannot use the Billing API")) {
                console.warn("Billing API is not supported for Custom Apps. Bypassing billing for development/testing.");
                // Append a dummy charge_id to simulate a successful callback from Shopify
                return `${returnUrl}&charge_id=custom_app_bypass`;
            }

            throw new Error(errors[0].message);
        }

        return response.data?.appSubscriptionCreate?.confirmationUrl;
    }
}
