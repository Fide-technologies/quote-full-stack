import { DeliveryMethod, type WebhookHandler } from "@shopify/shopify-api";
import { shopify } from "@/config/shopify.config";
import { logger } from "@/utils/logger";

export const customersDataRequestWebhookHandler: WebhookHandler = {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: shopify.config.webhooks.path,
    async callback(topic, shop, body, webhookId, apiVersion) {
        try {
            const payload = JSON.parse(body);
            logger.info("CUSTOMERS_DATA_REQUEST webhook received", {
                shop,
                webhookId,
                apiVersion,
                payload
            });

        } catch (error) {
            logger.error("Error handling CUSTOMERS_DATA_REQUEST webhook", {
                shop,
                webhookId,
                apiVersion,
                error,
            });
        }
    },
};
