import { Merchant, type IMerchant, type MerchantDocument } from "@/models/merchant.model";
import { injectable } from "inversify";
import type { IMerchantRepository } from "@/interfaces";
import { MongooseBaseRepository } from "../base/base.repository";
import type { UpdateWriteOpResult, DeleteResult } from "mongoose";

@injectable()
export class MerchantRepository
    extends MongooseBaseRepository<IMerchant>
    implements IMerchantRepository {
    constructor() {
        super(Merchant);
    }

    async findMerchantByShop(shop: string): Promise<MerchantDocument | null> {
        return await this.findOne({ shop });
    }

    async updateMerchant(merchant: Partial<IMerchant> & { shop: string }): Promise<UpdateWriteOpResult> {
        return await this.update({ shop: merchant.shop }, { $set: merchant });
    }

    async deleteMerchant(shop: string): Promise<DeleteResult> {
        return await this.deleteOne({ shop });
    }

    async findAllMerchants(): Promise<MerchantDocument[]> {
        return await this.findAll({});
    }

    async createMerchant(merchant: Partial<IMerchant>): Promise<MerchantDocument> {
        return await this.create(merchant);
    }

    async incrementQuoteUsage(shop: string, limit: number): Promise<MerchantDocument | null> {
        return await this.model.findOneAndUpdate(
            { shop, "usage.quotesUsed": { $lt: limit } },
            { $inc: { "usage.quotesUsed": 1 } },
            { new: true }
        ).exec();
    }

    async findById(id: string): Promise<MerchantDocument | null> {
        return await this.model.findById(id).exec();
    }

    async updateUsage(id: string, usage: any): Promise<void> {
        await this.model.updateOne({ _id: id }, usage).exec();
    }
}