import { useState, useCallback, useMemo } from 'react';
import type { DashboardStats } from '../api/dashboard';
import type { OnboardingStep } from '../types/dashboard';

export const useDashboardFilters = (stats: (DashboardStats & { deepLinkUrl?: string }) | undefined) => {
    const [selectedPeriod, setSelectedPeriod] = useState<string>('thisMonth');

    const handlePeriodChange = useCallback((value: string) => {
        setSelectedPeriod(value);
    }, []);

    const periodOptions = useMemo(() => [
        { label: 'Today', value: 'today' },
        { label: 'This Week', value: 'thisWeek' },
        { label: 'Last 30 Days', value: 'last30Days' },
        { label: 'This Month', value: 'thisMonth' },
        { label: 'This Year', value: 'thisYear' },
    ], []);

    const currentStats = useMemo(() => {
        if (!stats?.analytics) {
            return { total: 0, converted: 0, amount: 0 };
        }
        return stats.analytics[selectedPeriod as keyof typeof stats.analytics] || { total: 0, converted: 0, amount: 0 };
    }, [stats, selectedPeriod]);

    const steps = useMemo((): OnboardingStep[] => {
        const isAppEnabled = stats?.isAppEmbedded ?? false;

        return [
            {
                label: "Install and activate the app",
                completed: true,
                description: "Successfully installed in your store",
            },
            {
                label: "Customize your Quote Form",
                completed: !!stats?.totalQuotes && stats.totalQuotes > 0,
                description: "Adjust fields to gather the right info.",
            },
            {
                label: "Configure button visibility",
                completed: isAppEnabled,
                description: "Decide which products show the quote button.",
            },
            {
                label: "Receive your first quote",
                completed: !!stats?.totalQuotes && stats.totalQuotes > 0,
                description: "Wait for customers to start receiving quotes.",
            },
        ];
    }, [stats]);

    const progressInfo = useMemo(() => {
        const completedSteps = steps.filter((s) => s.completed).length;
        const totalSteps = steps.length;
        const progress = (completedSteps / totalSteps) * 100;

        return {
            completedSteps,
            totalSteps,
            progress,
        };
    }, [steps]);

    return {
        selectedPeriod,
        handlePeriodChange,
        periodOptions,
        currentStats,
        steps,
        progressInfo,
    };
};
