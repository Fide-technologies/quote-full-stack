import type { Session } from "@shopify/shopify-api";
import type { QuoteDocument } from "@/types";

export interface IDraftOrderService {
    createDraftOrderFromQuote(session: Session, quote: QuoteDocument): Promise<{
        draftOrderId: string;
        invoiceUrl: string;
    }>;
    checkDraftOrderExists(session: Session, draftOrderId: string): Promise<boolean>;
}
