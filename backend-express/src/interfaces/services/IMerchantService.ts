import type { IMerchant, MerchantDocument } from "@/types";
import type { UpdateWriteOpResult } from "mongoose";

export interface IMerchantService {
    getMerchantByShop(shop: string): Promise<MerchantDocument | null>;
    createOrUpdateMerchant(merchantData: Partial<IMerchant> & { shop: string }): Promise<MerchantDocument | UpdateWriteOpResult>;
    incrementQuoteUsage(shop: string, limit: number): Promise<MerchantDocument | null>;
}
