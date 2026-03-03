import type { WebhookHandlerMap } from "./types";
import { uninstallWebhookHandler } from "./handlers/uninstaall.webhook";

export const webhookHandlers: WebhookHandlerMap = {
    APP_UNINSTALLED: uninstallWebhookHandler,
}