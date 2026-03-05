import type { WebhookHandlerMap } from "./types";
import { uninstallWebhookHandler } from "./handlers/uninstall.webhook";

import { customersDataRequestWebhookHandler } from "./handlers/customers_data_request.webhook";
import { customersRedactWebhookHandler } from "./handlers/customers_redact.webhook";
import { shopRedactWebhookHandler } from "./handlers/shop_redact.webhook";
import { appSubscriptionsUpdateWebhookHandler } from "./handlers/app_subscriptions_update.webhook";

export const webhookHandlers: WebhookHandlerMap = {
    APP_UNINSTALLED: uninstallWebhookHandler,
    CUSTOMERS_DATA_REQUEST: customersDataRequestWebhookHandler,
    CUSTOMERS_REDACT: customersRedactWebhookHandler,
    SHOP_REDACT: shopRedactWebhookHandler,
    APP_SUBSCRIPTIONS_UPDATE: appSubscriptionsUpdateWebhookHandler,
}