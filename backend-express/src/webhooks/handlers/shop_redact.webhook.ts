import { DeliveryMethod, type WebhookHandler } from "@shopify/shopify-api";
import { shopify } from "@/config/shopify.config";
import { logger } from "@/utils/logger";
import { Merchant } from "@/models/merchant.model";
import { Quote } from "@/models/quote.model";
import { Form } from "@/models/form.model";
import { Plan } from "@/models/plan.model";

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
            logger.info("SHOP_REDACT webhook received. Clearing all data for shop:", shop, {
                shop,
                webhookId,
                apiVersion
            });

            // Handled: Delete all data collections related to the shop.
            // Merchants will have uninstalled by this time, but we 
            // perform the final data purge for GDPR compliance.

            await Promise.all([
                Quote.deleteMany({ shop }),
                Form.deleteMany({ shop }),
                // We typically keep the merchant record but marked as inactive?
                // Or delete entirely? GDPR says delete.
                Merchant.deleteOne({ shop }),
                // Session data will be cleared eventually through session storage if not done yet.
            ]);

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
