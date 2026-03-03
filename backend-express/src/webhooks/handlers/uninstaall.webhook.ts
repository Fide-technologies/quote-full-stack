import { DeliveryMethod, type WebhookHandler } from "@shopify/shopify-api";
import { shopify } from "@/config/shopify.config";
import { logger } from "@/utils/logger";
import { Merchant } from "@/models/merchant.model";

export const uninstallWebhookHandler: WebhookHandler = {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: shopify.config.webhooks.path,
    async callback(_topic, shop, _body, webhookId, apiVersion) {
        try {
            const offlineSessionId = `offline_${shop}`;
            const deletedOfflineSession =
                await shopify.config.sessionStorage.deleteSession(offlineSessionId);

            if (!deletedOfflineSession) {
                logger.info(`No offline session found to delete for shop: ${shop}`);
            } else {
                logger.info(`Deleted offline session for shop: ${shop}`);
            }

            const currentMerchant = await Merchant.findOne({ shop });

            if (!currentMerchant) {
                logger.info(`Merchant not found for shop: ${shop}`);
                return;
            }

            currentMerchant.isActive = false;
            await currentMerchant.save();

            logger.info(`Marked merchant as inactive for shop: ${shop}`, {
                webhookId,
                apiVersion,
            });
        } catch (error) {
            logger.error("Error handling APP_UNINSTALLED webhook", {
                shop,
                webhookId,
                apiVersion,
                error,
            });
            // Depending on your retry strategy, you may or may not throw here.
            // Throwing will cause Shopify to retry the webhook.
            // throw error;
        }
    },
}; 