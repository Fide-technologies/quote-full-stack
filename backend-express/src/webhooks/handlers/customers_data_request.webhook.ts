import { shopify } from "@/config/shopify.config";
import type { IQuoteRepository } from "@/interfaces";
import { container } from "@/inversify.config";
import { TYPES } from "@/types";
import { logger } from "@/utils/logger";
import { DeliveryMethod, type WebhookHandler } from "@shopify/shopify-api";

/**
 * Customers Data Request Webhook (GDPR - Mandatory)
 *
 * Triggered when a customer requests a copy of their personal data.
 * The app must identify and log all data held for that customer.
 * Shopify does NOT expect a direct API response — you must process
 * the request and respond to the merchant/customer out-of-band (email).
 */
export const customersDataRequestWebhookHandler: WebhookHandler = {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: shopify.config.webhooks.path,
    async callback(topic, shop, body, webhookId, apiVersion) {
        try {
            const payload = JSON.parse(body);
            const customerEmail = payload.customer?.email;
            const customerId = payload.customer?.id;

            logger.info("CUSTOMERS_DATA_REQUEST webhook received", {
                shop,
                webhookId,
                apiVersion,
                customerId,
                customerEmail,
            });

            if (customerEmail) {
                const quoteRepository = container.get<IQuoteRepository>(TYPES.IQuoteRepository);
                const customerQuotes = await quoteRepository.findByCustomerEmail(shop, customerEmail);

                logger.info(`GDPR Data Request: Found ${customerQuotes.length} quote(s) for customer`, {
                    shop,
                    customerEmail,
                    quoteIds: customerQuotes.map((q: { _id: unknown }) => q._id),
                });

                // NOTE: You must contact the customer/merchant out-of-band (e.g., via email)
                // with a summary of all data held. This log satisfies the requirement to
                // demonstrate data awareness. Implement email notification if required.
            } else {
                logger.warn("CUSTOMERS_DATA_REQUEST received without customer email", { shop, webhookId });
            }
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
