import { injectable } from "inversify";
import type { WebhookHandler } from "@shopify/shopify-api";
import type { IWebhookRegistry } from "@/interfaces";

@injectable()
export class WebhookRegistry implements IWebhookRegistry {
    private handlers: Record<string, WebhookHandler> = {};

    register(topic: string, handler: WebhookHandler): void {
        this.handlers[topic] = handler;
    }

    getHandlers(): Record<string, WebhookHandler> {
        return this.handlers;
    }
}
