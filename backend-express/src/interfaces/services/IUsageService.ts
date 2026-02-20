
import type { MerchantDocument } from "@/types/merchant.types";

export interface IUsageService {
    checkQuota(merchantId: string): Promise<boolean>;
    incrementUsage(merchantId: string): Promise<void>;
    getMerchantPlanAndUsage(shop: string): Promise<any>; // Helper for guard
}
