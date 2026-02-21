import { injectable, inject } from "inversify";
import { TYPES } from "@/types";
import type { IMerchantRepository, IPlanRepository } from "@/interfaces";
import type { IMerchantService } from "@/interfaces";
import type { IMerchant, MerchantDocument } from "@/models/merchant.model";
import { PlanType } from "@/constants";
import type { UpdateWriteOpResult } from "mongoose";

@injectable()
export class MerchantService implements IMerchantService {
    constructor(
        @inject(TYPES.IMerchantRepository) private merchantRepository: IMerchantRepository,
        @inject(TYPES.IPlanRepository) private planRepository: IPlanRepository
    ) { }

    async getMerchantByShop(shop: string): Promise<MerchantDocument | null> {
        return await this.merchantRepository.findMerchantByShop(shop);
    }

    async createOrUpdateMerchant(merchantData: Partial<IMerchant> & { shop: string }): Promise<MerchantDocument | UpdateWriteOpResult> {
        const existing = await this.merchantRepository.findMerchantByShop(merchantData.shop);

        if (existing) {
            return await this.merchantRepository.updateMerchant(merchantData);
        }

        const freePlan = await this.planRepository.findByName(PlanType.FREE);
        const dataToCreate = {
            ...merchantData,
            planId: freePlan?._id,
            usage: { quotesUsed: 0 }
        };

        return await this.merchantRepository.createMerchant(dataToCreate);
    }

    async incrementQuoteUsage(shop: string, limit: number): Promise<MerchantDocument | null> {
        return await this.merchantRepository.incrementQuoteUsage(shop, limit);
    }
}
