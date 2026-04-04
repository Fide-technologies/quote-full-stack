import { shopify } from "@/config/shopify.config";
import type { IPlanService } from "@/interfaces";
import { container } from "@/inversify.config";
import { TYPES } from "@/types";
import { logger } from "@/utils/logger";
import { DeliveryMethod, type WebhookHandler } from "@shopify/shopify-api";

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

            const planService = container.get<IPlanService>(TYPES.IPlanService);
            const subscriptionId =
                subscription.id ||
                (subscription.admin_graphql_api_id ? subscription.admin_graphql_api_id.split("/").pop() : null);

            if (!subscriptionId) {
                logger.error(`No subscription ID found in payload for ${shop}`, { payload });
                return;
            }

            await planService.handleSubscriptionUpdate(shop, subscriptionId);
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
