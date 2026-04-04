export interface DashboardStats {
    totalQuotes: number;
    convertedQuotes: number;
    currentPlan: string;
    daysRemaining: number;
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
