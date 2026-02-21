
import { injectable, inject } from "inversify";
import { TYPES } from "@/types/types";
import type { IMerchantRepository } from "@/interfaces/repositories/IMerchantRepository";
import type { IPlanRepository } from "@/interfaces/repositories/IPlanRepository";
import type { IUsageService } from "@/interfaces/services/IUsageService";
import type { MerchantDocument } from "@/types/merchant.types";
import type { PlanDocument } from "@/types/plan.types";
import { ERROR_MESSAGES } from "@/constants";

@injectable()
export class UsageService implements IUsageService {
    constructor(
        @inject(TYPES.IMerchantRepository) private merchantRepository: IMerchantRepository,
        @inject(TYPES.IPlanRepository) private planRepository: IPlanRepository
    ) { }

    async getMerchantPlanAndUsage(shop: string): Promise<{ merchant: MerchantDocument; plan: PlanDocument }> {
        const merchant = await this.merchantRepository.findOne({ shop });
        if (!merchant) throw new Error(ERROR_MESSAGES.MERCHANT.NOT_FOUND_FOR_SHOP(shop));


        if (!merchant.planId) {
            throw new Error(ERROR_MESSAGES.MERCHANT.NO_PLAN);
        }

        const plan = await this.planRepository.findOne({ _id: merchant.planId });
        if (!plan) throw new Error(ERROR_MESSAGES.PLAN.NOT_FOUND);

        return { merchant: merchant as MerchantDocument, plan: plan as PlanDocument };
    }

    async checkQuota(merchantId: string): Promise<boolean> {
        const merchant = await this.merchantRepository.findOne({ _id: merchantId });
        if (!merchant || !merchant.planId) return false;

        const plan = await this.planRepository.findOne({ _id: merchant.planId });
        if (!plan) return false;

        const mDoc = merchant as MerchantDocument;
        const pDoc = plan as PlanDocument;

        await this.resetQuotaIfNeeded(mDoc, pDoc);

        // We re-fetch or rely on correct logic. Since checkQuota doesn't persist,
        // we might be okay. But resetQuotaIfNeeded DOES persist.
        // If we reset, quotesUsed becomes 0.
        // To be safe, if we reset, we should use 0.

        // Simpler: Check logic again after potential reset.
        if (pDoc.billingReset) {
            // If we just reset, it's 0.
            // If we didn't, we use current.
            // Actually resetQuotaIfNeeded updates local object too.
        }

        if (mDoc.usage.quotesUsed >= pDoc.quoteLimit) {
            return false;
        }

        return true;
    }

    async incrementUsage(merchantId: string): Promise<void> {
        // We use update with atomic operator
        await this.merchantRepository.update(
            { _id: merchantId },
            { $inc: { "usage.quotesUsed": 1 } }
        );
    }

    async resetQuotaIfNeeded(merchant: MerchantDocument, plan: PlanDocument): Promise<void> {
        if (!plan.billingReset) return;

        const now = new Date();
        const start = merchant.usage.quotaPeriodStart || merchant.createdAt;
        const nextBillingDate = new Date(start);
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

        if (now >= nextBillingDate) {
            await this.merchantRepository.update(
                { _id: merchant._id },
                {
                    $set: {
                        "usage.quotesUsed": 0,
                        "usage.quotaPeriodStart": now
                    }
                }
            );
            // Update local instance to reflect changes for immediate checks
            merchant.usage.quotesUsed = 0;
            merchant.usage.quotaPeriodStart = now;
        } else if (!merchant.usage.quotaPeriodStart) {
            // Initialize usage period if missing
            await this.merchantRepository.update(
                { _id: merchant._id },
                { $set: { "usage.quotaPeriodStart": now } }
            );
            merchant.usage.quotaPeriodStart = now;
        }
    }
}
