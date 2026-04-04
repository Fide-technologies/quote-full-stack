import { shopify } from "@/config/shopify.config";
import type { IQuoteService } from "@/interfaces";
import { container } from "@/inversify.config";
import { TYPES } from "@/types";
import { logger } from "@/utils/logger";
import { DeliveryMethod, type WebhookHandler } from "@shopify/shopify-api";

/**
 * Customers Redact Webhook
 *
 * Triggered when a merchant requests that you delete all data related to a specific customer.
 */
export const customersRedactWebhookHandler: WebhookHandler = {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: shopify.config.webhooks.path,
    async callback(topic, shop, body, webhookId, apiVersion) {
        try {
            const payload = JSON.parse(body);
            const customerEmail = payload.customer?.email;

            logger.info("CUSTOMERS_REDACT webhook received for customer email:", customerEmail);

            if (customerEmail) {
                const quoteService = container.get<IQuoteService>(TYPES.IQuoteService);
                await quoteService.redactCustomerData(customerEmail);
                logger.info(`Successfully redacted data for customer email: ${customerEmail}`);
            }
        } catch (error) {
            logger.error("Error handling CUSTOMERS_REDACT webhook", {
                shop,
                webhookId,
                apiVersion,
                error,
            });
        }
    },
};
