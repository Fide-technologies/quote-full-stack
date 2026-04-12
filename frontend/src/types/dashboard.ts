export interface OnboardingStep {
    label: string;
    completed: boolean;
    description: string;
}

export interface GettingStartedProps {
    steps: OnboardingStep[];
    progress: number;
    completedCount: number;
    totalCount: number;
    deepLinkUrl: string;
    isAppEnabled: boolean;
}

export interface AnalyticsSectionProps {
    periodOptions: { label: string; value: string }[];
    selectedPeriod: string;
    onPeriodChange: (value: string) => void;
    currentStats: { total: number; converted: number; amount: number };
    allTimeStats: { totalQuotes: number; convertedQuotes: number; yearAmount: number };
}

export interface QuickStatsCardProps {
    totalQuotes: number;
    convertedQuotes: number;
}

export interface AnalyticsCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    tone?: 'success' | 'subdued' | 'critical';
}

export interface AppConnectivityCardProps {
    isAppEnabled: boolean;
    deepLinkUrl: string;
    loading?: boolean;
}
