import type { IQuoteRepository } from "@/interfaces";
import type { PaginatedResult, PaginationOptions } from "@/interfaces";
import { Quote } from "@/models/quote.model";
import type { IQuote, QuoteDocument } from "@/types";
import { injectable } from "inversify";
import type { DeleteResult, QueryFilter, UpdateWriteOpResult } from "mongoose";
import { MongooseBaseRepository } from "../base/base.repository";

@injectable()
export class QuoteRepository extends MongooseBaseRepository<IQuote> implements IQuoteRepository {
    constructor() {
        super(Quote);
    }

    async findByMerchant(
        shop: string,
        options: PaginationOptions,
        filters: { q?: string; status?: string; date?: string; hasDraftOrder?: boolean } = {},
    ): Promise<PaginatedResult<QuoteDocument>> {
        const { page, limit } = options;
        const skip = (page - 1) * limit;

        const query: Record<string, unknown> = { shop };

        if (filters.status) {
            query.status = filters.status;
        }

        if (filters.hasDraftOrder !== undefined) {
            if (filters.hasDraftOrder) {
                query.draftOrderId = { $exists: true, $ne: "" };
            } else {
                query.$or = [{ draftOrderId: { $exists: false } }, { draftOrderId: "" }];
            }
        }

        if (filters.date) {
            const startDate = new Date(filters.date);
            const endDate = new Date(filters.date);
            endDate.setDate(endDate.getDate() + 1);
            query.createdAt = {
                $gte: startDate,
                $lt: endDate,
            };
        }

        if (filters.q) {
            const searchRegex = new RegExp(filters.q, "i");
            const existingOr = (query.$or as Array<unknown>) || [];
            query.$or = [
                ...existingOr,
                { firstName: searchRegex },
                { lastName: searchRegex },
                { customerEmail: searchRegex },
                { productTitle: searchRegex },
            ];
        }

        const [data, total] = await Promise.all([
            this.model
                .find(query as QueryFilter<IQuote>)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.model.countDocuments(query as QueryFilter<IQuote>).exec(),
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findById(id: string): Promise<QuoteDocument | null> {
        return await this.model.findById(id).exec();
    }

    async updateStatus(id: string, status: IQuote["status"]): Promise<QuoteDocument | null> {
        return await Quote.findByIdAndUpdate(id, { status }, { new: true });
    }

    async deleteById(id: string): Promise<DeleteResult> {
        return await Quote.deleteOne({ _id: id });
    }

    async countByMerchant(shop: string): Promise<number> {
        return await Quote.countDocuments({ shop });
    }

    async countConvertedByMerchant(shop: string): Promise<number> {
        return await Quote.countDocuments({
            shop,
            draftOrderId: { $exists: true, $ne: "" },
        });
    }

    async deleteByShop(shop: string): Promise<DeleteResult> {
        return await Quote.deleteMany({ shop });
    }

    async redactByCustomerEmail(email: string): Promise<UpdateWriteOpResult> {
        return await Quote.updateMany(
            { $or: [{ email: email }, { customerEmail: email }] },
            {
                $set: {
                    firstName: "[REDACTED]",
                    lastName: "[REDACTED]",
                    customerName: "[REDACTED]",
                    email: "[REDACTED]",
                    customerEmail: "[REDACTED]",
                    phone: "[REDACTED]",
                    address1: "[REDACTED]",
                    address2: "[REDACTED]",
                    city: "[REDACTED]",
                    state: "[REDACTED]",
                    pincode: "[REDACTED]",
                    country: "[REDACTED]",
                    message: "[REDACTED]",
                    customerMessage: "[REDACTED]",
                },
            },
        );
    }

    async findByCustomerEmail(shop: string, email: string): Promise<QuoteDocument[]> {
        return await this.model
            .find({
                shop,
                $or: [{ email }, { customerEmail: email }],
            })
            .select("_id status createdAt productTitle customerEmail customerName")
            .exec();
    }

    async getAnalyticsByMerchant(shop: string): Promise<{
        today: { total: number; converted: number; amount: number };
        thisWeek: { total: number; converted: number; amount: number };
        last30Days: { total: number; converted: number; amount: number };
        thisMonth: { total: number; converted: number; amount: number };
        thisYear: { total: number; converted: number; amount: number };
    }> {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const last30Days = new Date(now);
        last30Days.setDate(now.getDate() - 30);

        const getFacetPipeline = (dateLimit: Date) => [
            { $match: { shop, createdAt: { $gte: dateLimit } } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    converted: {
                        $sum: {
                            $cond: [{ $and: [{ $gt: ["$draftOrderId", null] }, { $ne: ["$draftOrderId", ""] }] }, 1, 0],
                        },
                    },
                    amount: {
                        $sum: {
                            $cond: [
                                { $and: [{ $gt: ["$draftOrderId", null] }, { $ne: ["$draftOrderId", ""] }] },
                                "$totalPrice",
                                0,
                            ],
                        },
                    },
                },
            },
        ];

        const results = await this.model.aggregate([
            {
                $facet: {
                    today: getFacetPipeline(startOfToday),
                    thisWeek: getFacetPipeline(startOfWeek),
                    thisMonth: getFacetPipeline(startOfMonth),
                    thisYear: getFacetPipeline(startOfYear),
                    last30Days: getFacetPipeline(last30Days),
                },
            },
        ]);

        const formatResult = (facetResult: any[]) => ({
            total: facetResult[0]?.total || 0,
            converted: facetResult[0]?.converted || 0,
            amount: Number(facetResult[0]?.amount || 0),
        });

        const facetData = results[0];

        return {
            today: formatResult(facetData.today),
            thisWeek: formatResult(facetData.thisWeek),
            last30Days: formatResult(facetData.last30Days),
            thisMonth: formatResult(facetData.thisMonth),
            thisYear: formatResult(facetData.thisYear),
        };
    }
}
