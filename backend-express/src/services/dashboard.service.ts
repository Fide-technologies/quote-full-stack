import { PlanType } from "@/constants";
import type {
    IDashboardService,
    IDashboardStats,
    IMerchantService,
    IPlanService,
    IQuoteRepository,
    ISettingsService,
} from "@/interfaces";
import { TYPES } from "@/types";
import type { Session } from "@shopify/shopify-api";
import { inject, injectable } from "inversify";

@injectable()
export class DashboardService implements IDashboardService {
    constructor(
        @inject(TYPES.IMerchantService) private merchantService: IMerchantService,
        @inject(TYPES.IQuoteRepository) private quoteRepository: IQuoteRepository,
        @inject(TYPES.IPlanService) private planService: IPlanService,
        @inject(TYPES.ISettingsService) private settingsService: ISettingsService,
    ) {}

    async getStats(session: Session): Promise<IDashboardStats> {
        const { shop } = session;
        const merchant = await this.merchantService.getMerchantByShop(shop);
        if (!merchant) {
            throw new Error("Merchant not found");
        }

        const [totalQuotes, convertedQuotes, plan, themeAudit] = await Promise.all([
            this.quoteRepository.countByMerchant(shop),
            this.quoteRepository.countConvertedByMerchant(shop),
            this.planService.getMerchantPlan(shop),
            this.settingsService.checkAppEmbedStatus(session),
        ]);

        const currentPlan = plan?.name || PlanType.FREE;

        let daysRemaining = 0;
        const quotaStart = merchant.usage?.quotaPeriodStart || merchant.createdAt;
        if (quotaStart) {
            const nextBillingDate = new Date(quotaStart);
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

            const now = new Date();
            const diffMs = nextBillingDate.getTime() - now.getTime();
            daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        }

        const shopHandle = shop.split(".")[0];
        const deepLinkUrl = themeAudit.themeId
            ? `https://admin.shopify.com/store/${shopHandle}/themes/${themeAudit.themeId}/editor?context=apps`
            : "shopify:admin/themes/current/editor?context=apps";

        return {
            totalQuotes,
            convertedQuotes,
            currentPlan: String(currentPlan),
            daysRemaining,
            isAppEmbedded: themeAudit.isEmbedded,
            activeThemeId: themeAudit.themeId,
            deepLinkUrl,
        };
    }
}
