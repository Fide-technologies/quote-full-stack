import { shopify } from "@/config/shopify.config";
import type { IMerchantService } from "@/interfaces";
import { container } from "@/inversify.config";
import { TYPES } from "@/types";
import { logger } from "@/utils/logger";
import { DeliveryMethod, type WebhookHandler } from "@shopify/shopify-api";

export const uninstallWebhookHandler: WebhookHandler = {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: shopify.config.webhooks.path,
    async callback(_topic, shop, _body, webhookId, apiVersion) {
        try {
            logger.info(`Processing APP_UNINSTALLED webhook for shop: ${shop}`);

            const merchantService = container.get<IMerchantService>(TYPES.IMerchantService);
            await merchantService.uninstallMerchant(shop);

            logger.info(`Successfully handled APP_UNINSTALLED for shop: ${shop}`, {
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
        }
    },
};
