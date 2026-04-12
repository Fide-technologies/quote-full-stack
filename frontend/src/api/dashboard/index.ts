export interface IAnalyticsGroup {
    total: number;
    converted: number;
    amount: number;
}

export interface DashboardStats {
    totalQuotes: number;
    convertedQuotes: number;
    currentPlan: string;
    daysRemaining: number;
    isAppEmbedded: boolean;
    deepLinkUrl: string;
    activeThemeId: string;
    analytics: {
        today: IAnalyticsGroup;
        thisWeek: IAnalyticsGroup;
        last30Days: IAnalyticsGroup;
        thisMonth: IAnalyticsGroup;
        thisYear: IAnalyticsGroup;
    };
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const response = await fetch('/api/dashboard/stats', {
    });
    if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
    }
    const json = await response.json();
    return json.data; // Note: BaseController returns { success, data, message }
};
