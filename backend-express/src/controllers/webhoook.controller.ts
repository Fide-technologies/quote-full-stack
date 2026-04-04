import { shopify } from "@/config";
import { webhookHandlers } from "@/webhooks";
import { injectable } from "inversify";

@injectable()
export class WebhooksController {
    public process = shopify.processWebhooks({ webhookHandlers });
}
