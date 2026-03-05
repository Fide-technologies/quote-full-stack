import { DeliveryMethod, type WebhookHandler } from "@shopify/shopify-api";
import { shopify } from "@/config/shopify.config";
import { logger } from "@/utils/logger";
import { Merchant } from "@/models/merchant.model";
import { Plan } from "@/models/plan.model";

/**
 * App Subscriptions Update Webhook
 * 
 * Triggered when a merchant's subscription changes (e.g. they cancel it via Shopify Admin).
 */
export const appSubscriptionsUpdateWebhookHandler: WebhookHandler = {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: shopify.config.webhooks.path,
    async callback(topic, shop, body, webhookId, apiVersion) {
        try {
            const payload = JSON.parse(body);
            const subscription = payload.app_subscription;

            if (!subscription) {
                logger.warn("APP_SUBSCRIPTIONS_UPDATE received without subscription details", { shop });
                return;
            }

            logger.info(`APP_SUBSCRIPTIONS_UPDATE for ${shop}. Status: ${subscription.status}`);

            // Find the merchant
            const merchant = await Merchant.findOne({ shop });
            if (!merchant) {
                logger.info(`Merchant not found for shop: ${shop}`);
                return;
            }

            // Status can be ACTIVE, CANCELLED, DECLINED, EXPIRED, FROZEN, PENDING
            // If the subscription is no longer active, we should downgrade the merchant to FREE.
            if (subscription.status !== "ACTIVE") {
                logger.info(`Subscription ${subscription.status} for ${shop}. Downgrading to FREE plan in database.`);

                const freePlan = await Plan.findOne({ name: "FREE" });
                if (freePlan) {
                    merchant.planId = freePlan._id;
                    await merchant.save();
                    logger.info(`Merchant ${shop} successfully downgraded to FREE plan.`);
                } else {
                    logger.error("Could not find FREE plan to downgrade merchant.");
                }
            } else {
                // Subscription is active. Ensure the database matches the plan name from Shopify.
                const planName = subscription.name; // e.g. "PRO"
                const activePlan = await Plan.findOne({ name: planName });
                if (activePlan) {
                    merchant.planId = activePlan._id;
                    await merchant.save();
                    logger.info(`Merchant ${shop} plan verified as ${planName}.`);
                }
            }

        } catch (error) {
            logger.error("Error handling APP_SUBSCRIPTIONS_UPDATE webhook", {
                shop,
                webhookId,
                apiVersion,
                error,
            });
        }
    },
};
