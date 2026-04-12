import type { IQuote, QuoteDocument } from "@/types";
import type { PaginatedResult, PaginationOptions } from "../IPagination";

export interface IQuoteRepository {
    create(quoteData: Partial<IQuote>): Promise<QuoteDocument>;
    findByMerchant(
        shop: string,
        options: PaginationOptions,
        filters?: { q?: string; status?: string; date?: string; hasDraftOrder?: boolean },
    ): Promise<PaginatedResult<QuoteDocument>>;
    findById(id: string): Promise<QuoteDocument | null>;
    updateStatus(id: string, status: IQuote["status"]): Promise<QuoteDocument | null>;
    deleteById(id: string): Promise<unknown>;
    countByMerchant(shop: string): Promise<number>;
    countConvertedByMerchant(shop: string): Promise<number>;
    deleteByShop(shop: string): Promise<unknown>;
    redactByCustomerEmail(email: string): Promise<unknown>;
    findByCustomerEmail(shop: string, email: string): Promise<QuoteDocument[]>;
    getAnalyticsByMerchant(shop: string): Promise<{
        today: { total: number; converted: number; amount: number };
        thisWeek: { total: number; converted: number; amount: number };
        last30Days: { total: number; converted: number; amount: number };
        thisMonth: { total: number; converted: number; amount: number };
        thisYear: { total: number; converted: number; amount: number };
    }>;
}
