import type { IMerchant, MerchantDocument } from "@/types";
import type { UpdateWriteOpResult, DeleteResult } from "mongoose";

export interface IMerchantRepository {
    createMerchant(merchant: Partial<IMerchant>): Promise<MerchantDocument>;
    findMerchantByShop(shop: string): Promise<MerchantDocument | null>;
    updateMerchant(merchant: Partial<IMerchant> & { shop: string }): Promise<UpdateWriteOpResult>;
    deleteMerchant(shop: string): Promise<DeleteResult>;
    findAllMerchants(): Promise<MerchantDocument[]>;
    incrementQuoteUsage(shop: string, limit: number): Promise<MerchantDocument | null>;
    findById(id: string): Promise<MerchantDocument | null>;
    updateUsage(id: string, usage: any): Promise<void>;
    findOne(filter: any): Promise<MerchantDocument | null>;
    update(filter: any, update: any): Promise<any>;
}
