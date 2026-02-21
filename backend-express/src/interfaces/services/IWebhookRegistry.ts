import type { WebhookHandler } from "@shopify/shopify-api";

export interface IWebhookHandler {
    topic: string;
    handler: WebhookHandler;
}

export interface IWebhookRegistry {
    register(topic: string, handler: WebhookHandler): void;
    getHandlers(): Record<string, WebhookHandler>;
}
