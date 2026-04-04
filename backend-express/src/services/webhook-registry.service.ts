import type { IWebhookRegistry } from "@/interfaces";
import type { WebhookHandler } from "@shopify/shopify-api";
import { injectable } from "inversify";

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
