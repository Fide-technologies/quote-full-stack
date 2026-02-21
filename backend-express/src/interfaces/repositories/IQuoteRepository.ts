import type { IQuote, QuoteDocument } from "@/types";
import type { PaginationOptions, PaginatedResult } from "../IPagination";

export interface IQuoteRepository {
    create(quoteData: Partial<IQuote>): Promise<QuoteDocument>;
    findByMerchant(shop: string, options: PaginationOptions, filters?: { q?: string; status?: string; date?: string; hasDraftOrder?: boolean }): Promise<PaginatedResult<QuoteDocument>>;
    findById(id: string): Promise<QuoteDocument | null>;
    updateStatus(id: string, status: IQuote["status"]): Promise<QuoteDocument | null>;
    countByMerchant(shop: string): Promise<number>;
}
