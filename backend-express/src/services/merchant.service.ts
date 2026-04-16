import { shopify } from "@/config/shopify.config";
import { PlanType, SubscriptionStatus } from "@/constants";
import type { IFormRepository, IMerchantRepository, IPlanRepository, IQuoteRepository } from "@/interfaces";
import type { IMerchantService } from "@/interfaces";
import type { IMerchant, MerchantDocument } from "@/models/merchant.model";
import { TYPES } from "@/types";
import { inject, injectable } from "inversify";
import type { UpdateWriteOpResult } from "mongoose";

@injectable()
export class MerchantService implements IMerchantService {
    constructor(
        @inject(TYPES.IMerchantRepository) private merchantRepository: IMerchantRepository,
        @inject(TYPES.IPlanRepository) private planRepository: IPlanRepository,
        @inject(TYPES.IQuoteRepository) private quoteRepository: IQuoteRepository,
        @inject(TYPES.IFormRepository) private formRepository: IFormRepository,
    ) { }

    async getMerchantByShop(shop: string): Promise<MerchantDocument | null> {
        return await this.merchantRepository.findMerchantByShop(shop);
    }

    async createOrUpdateMerchant(
        merchantData: Partial<IMerchant> & { shop: string },
    ): Promise<MerchantDocument | UpdateWriteOpResult> {
        const existing = await this.merchantRepository.findMerchantByShop(merchantData.shop);

        if (existing) {
            // Reinstall case: Ensure isActive is true. Status will be updated via webhook or on plan upgrade.
            return await this.merchantRepository.updateMerchant({ ...merchantData, isActive: true });
        }

        const freePlan = await this.planRepository.findByName(PlanType.FREE);
        const dataToCreate = {
            ...merchantData,
            planId: freePlan?._id,
            subscriptionStatus: SubscriptionStatus.ACTIVE,
            isActive: true, // Always active on new/re-install
            usage: { quotesUsed: 0, quotaPeriodStart: new Date() },
        };

        return await this.merchantRepository.createMerchant(dataToCreate);
    }

    async incrementQuoteUsage(shop: string, limit: number): Promise<MerchantDocument | null> {
        return await this.merchantRepository.incrementQuoteUsage(shop, limit);
    }

    async uninstallMerchant(shop: string): Promise<void> {
        const merchant = await this.merchantRepository.findMerchantByShop(shop);
        if (merchant) {
            await this.merchantRepository.updateMerchant({ shop, isActive: false });
        }
    }

    async redactMerchantData(shop: string): Promise<void> {
        await Promise.all([
            this.quoteRepository.deleteByShop(shop),
            this.formRepository.deleteByShop(shop),
            this.merchantRepository.deleteMerchant(shop),
        ]);
    }
}
