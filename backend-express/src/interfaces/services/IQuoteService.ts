import type { IQuote, QuoteDocument } from "@/types";
import type { PaginatedResult } from "../IPagination";
import type { Session } from "@shopify/shopify-api";

export interface IQuoteService {
    createQuote(shop: string, quoteData: Partial<IQuote>): Promise<QuoteDocument>;
    getQuotesByMerchant(shop: string, page: number, limit: number, filters?: { q?: string; status?: string; date?: string; hasDraftOrder?: boolean }): Promise<PaginatedResult<QuoteDocument>>;
    getEnrichedQuotesByMerchant(session: Session, page: number, limit: number, filters?: { q?: string; status?: string; date?: string; hasDraftOrder?: boolean }): Promise<PaginatedResult<QuoteDocument & { productDetails?: any }>>;
    updateQuoteStatus(id: string, status: IQuote["status"]): Promise<QuoteDocument | null>;
    createDraftOrder(session: Session, quoteId: string): Promise<{ draftOrderId: string; invoiceUrl: string }>;
}
