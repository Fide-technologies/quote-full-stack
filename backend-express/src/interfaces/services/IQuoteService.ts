import type { IQuote, QuoteDocument } from "@/types";
import type { Session } from "@shopify/shopify-api";
import type { PaginatedResult } from "../IPagination";

export interface IQuoteService {
    createQuote(shop: string, quoteData: Partial<IQuote>): Promise<QuoteDocument>;
    getQuotesByMerchant(
        shop: string,
        page: number,
        limit: number,
        filters?: { q?: string; status?: string; date?: string; hasDraftOrder?: boolean },
    ): Promise<PaginatedResult<QuoteDocument>>;
    getEnrichedQuotesByMerchant(
        session: Session,
        page: number,
        limit: number,
        filters?: { q?: string; status?: string; date?: string; hasDraftOrder?: boolean },
    ): Promise<PaginatedResult<QuoteDocument & { productDetails?: unknown }>>;
    updateQuoteStatus(session: Session, id: string, status: IQuote["status"]): Promise<QuoteDocument | null>;
    deleteQuote(session: Session, id: string): Promise<void>;
    createDraftOrder(session: Session, quoteId: string): Promise<{ draftOrderId: string; invoiceUrl: string }>;
    getQuoteById(session: Session, id: string): Promise<(QuoteDocument & { productDetails?: unknown }) | null>;
    acceptQuote(session: Session, quoteId: string, price: number, quantity: number, message: string): Promise<void>;
    rejectQuote(session: Session, quoteId: string, message: string): Promise<void>;
    redactCustomerData(email: string): Promise<void>;
}
