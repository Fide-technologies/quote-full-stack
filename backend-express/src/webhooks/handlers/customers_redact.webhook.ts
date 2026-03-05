import { DeliveryMethod, type WebhookHandler } from "@shopify/shopify-api";
import { shopify } from "@/config/shopify.config";
import { logger } from "@/utils/logger";
import { Quote } from "@/models/quote.model";

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
            const customerEmail = payload.customer.email;

            logger.info("CUSTOMERS_REDACT webhook received. Redacting for customer email:", customerEmail, {
                shop,
                webhookId,
                apiVersion
            });

            // Handled: Find quotes associated with this customer email and redact 
            // the personal details (keep the quote record but remove personal data if preferred, 
            // or delete entirely based on app requirements).
            // For now, let's redact the names and emails.
            if (customerEmail) {
                await Quote.updateMany(
                    { $or: [{ email: customerEmail }, { customerEmail: customerEmail }] },
                    {
                        $set: {
                            firstName: "[REDACTED]",
                            lastName: "[REDACTED]",
                            customerName: "[REDACTED]",
                            email: "[REDACTED]",
                            customerEmail: "[REDACTED]",
                            phoneNumber: "[REDACTED]", // Match field in model
                            phone: "[REDACTED]",
                            address1: "[REDACTED]",
                            address2: "[REDACTED]",
                            city: "[REDACTED]",
                            state: "[REDACTED]",
                            pincode: "[REDACTED]",
                            country: "[REDACTED]",
                            isRedacted: true
                        }
                    }
                );
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
