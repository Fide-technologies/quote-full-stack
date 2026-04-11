import type { Session } from "@shopify/shopify-api";

export interface IAnalyticsGroup {
    total: number;
    converted: number;
    amount: number;
}

export interface IDashboardStats {
    totalQuotes: number;
    convertedQuotes: number;
    currentPlan: string;
    daysRemaining: number;
    isAppEmbedded: boolean;
    activeThemeId: string;
    deepLinkUrl: string;
    analytics: {
        today: IAnalyticsGroup;
        thisWeek: IAnalyticsGroup;
        last30Days: IAnalyticsGroup;
        thisMonth: IAnalyticsGroup;
        thisYear: IAnalyticsGroup;
    };
}

export interface IDashboardService {
    getStats(session: Session): Promise<IDashboardStats>;
}
