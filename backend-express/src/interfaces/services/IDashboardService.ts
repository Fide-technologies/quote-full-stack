import type { Session } from "@shopify/shopify-api";

export interface IDashboardStats {
    totalQuotes: number;
    convertedQuotes: number;
    currentPlan: string;
    daysRemaining: number;
    isAppEmbedded: boolean;
    activeThemeId: string;
    deepLinkUrl: string;
}

export interface IDashboardService {
    getStats(session: Session): Promise<IDashboardStats>;
}
