import type { MerchantDocument } from "@/types/merchant.types";
import type { PlanDocument } from "@/types/plan.types";

export interface IUsageService {
    checkQuota(merchantId: string): Promise<boolean>;
    incrementUsage(merchantId: string): Promise<void>;
    getMerchantPlanAndUsage(shop: string): Promise<{ merchant: MerchantDocument; plan: PlanDocument }>; // Helper for guard
}
