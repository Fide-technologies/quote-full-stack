import type { IMerchant, MerchantDocument } from "@/types";
import type { DeleteResult, UpdateWriteOpResult } from "mongoose";

export interface IMerchantRepository {
    createMerchant(merchant: Partial<IMerchant>): Promise<MerchantDocument>;
    findMerchantByShop(shop: string): Promise<MerchantDocument | null>;
    updateMerchant(merchant: Partial<IMerchant> & { shop: string }): Promise<UpdateWriteOpResult>;
    deleteMerchant(shop: string): Promise<DeleteResult>;
    findAllMerchants(): Promise<MerchantDocument[]>;
    incrementQuoteUsage(shop: string, limit: number): Promise<MerchantDocument | null>;
    findById(id: string): Promise<MerchantDocument | null>;
    updateUsage(id: string, usage: Record<string, unknown>): Promise<void>;
    findOne(filter: Record<string, unknown>): Promise<MerchantDocument | null>;
    update(filter: Record<string, unknown>, update: Record<string, unknown>): Promise<unknown>;
}
