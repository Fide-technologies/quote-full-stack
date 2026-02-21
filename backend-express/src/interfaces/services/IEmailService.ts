import type { QuoteDocument } from "@/types";

export interface IEmailService {
    sendQuoteNotification(shop: string, quote: QuoteDocument): Promise<void>;
}
