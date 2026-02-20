import { Quote } from "@/models/quote.model";
import { injectable } from "inversify";
import type { IQuoteRepository } from "@/interfaces";
import { MongooseBaseRepository } from "../base/base.repository";
import type { PaginatedResult, PaginationOptions } from "@/interfaces";
import type { IQuote, QuoteDocument } from "@/types";

@injectable()
export class QuoteRepository
    extends MongooseBaseRepository<IQuote>
    implements IQuoteRepository {
    constructor() {
        super(Quote);
    }

    async findByMerchant(shop: string, options: PaginationOptions, filters: { q?: string; status?: string; date?: string; hasDraftOrder?: boolean } = {}): Promise<PaginatedResult<QuoteDocument>> {
        const { page, limit } = options;
        const skip = (page - 1) * limit;

        const query: any = { shop };

        if (filters.status) {
            query.status = filters.status;
        }

        if (filters.hasDraftOrder !== undefined) {
            if (filters.hasDraftOrder) {
                query.draftOrderId = { $exists: true, $ne: "" };
            } else {
                query.$or = [
                    { draftOrderId: { $exists: false } },
                    { draftOrderId: "" }
                ];
            }
        }

        if (filters.date) {
            const startDate = new Date(filters.date);
            const endDate = new Date(filters.date);
            endDate.setDate(endDate.getDate() + 1);
            query.createdAt = {
                $gte: startDate,
                $lt: endDate
            };
        }

        if (filters.q) {
            const searchRegex = new RegExp(filters.q, 'i');
            query.$or = [
                { firstName: searchRegex },
                { lastName: searchRegex },
                { customerEmail: searchRegex },
                { productTitle: searchRegex },
            ];
        }

        const [data, total] = await Promise.all([
            this.model.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
            this.model.countDocuments(query).exec()
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async findById(id: string): Promise<QuoteDocument | null> {
        return await this.findOne({ _id: id } as any);
    }

    async updateStatus(id: string, status: IQuote["status"]): Promise<QuoteDocument | null> {
        return await Quote.findByIdAndUpdate(id, { status }, { new: true });
    }

    async countByMerchant(shop: string): Promise<number> {
        return await Quote.countDocuments({ shop });
    }
}
