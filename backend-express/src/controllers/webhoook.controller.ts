import { injectable } from "inversify";
import { shopify } from "@/config";
import { webhookHandlers } from "@/webhooks";

@injectable()
export class WebhooksController {
    public process = shopify.processWebhooks({ webhookHandlers });
}
