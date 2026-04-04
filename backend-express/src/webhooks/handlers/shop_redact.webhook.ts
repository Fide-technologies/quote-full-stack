import { shopify } from "@/config/shopify.config";
import type { IMerchantService } from "@/interfaces";
import { container } from "@/inversify.config";
import { TYPES } from "@/types";
import { logger } from "@/utils/logger";
import { DeliveryMethod, type WebhookHandler } from "@shopify/shopify-api";

/**
 * Shop Redact Webhook
 *
 * Triggered when a merchant requests that you delete all data related to their shop.
 */
export const shopRedactWebhookHandler: WebhookHandler = {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: shopify.config.webhooks.path,
    async callback(topic, shop, body, webhookId, apiVersion) {
        try {
            logger.info("SHOP_REDACT webhook received. Clearing all data for shop:", shop);

            const merchantService = container.get<IMerchantService>(TYPES.IMerchantService);
            await merchantService.redactMerchantData(shop);

            logger.info(`Successfully deleted all data for merchant account belonging to shop: ${shop}`);
        } catch (error) {
            logger.error("Error handling SHOP_REDACT webhook", {
                shop,
                webhookId,
                apiVersion,
                error,
            });
        }
    },
};
