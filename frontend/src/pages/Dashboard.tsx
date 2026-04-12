import {
    BlockStack,
    Layout,
    Page,
} from "@shopify/polaris";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { useAppExtensions } from "../hooks/useAppExtensions";
import { useDashboardFilters } from "../hooks/useDashboardFilters";

// Sub-components
import { AnalyticsSection } from "../components/dashboard/AnalyticsSection";
import { GettingStarted } from "../components/dashboard/GettingStarted";
import { QuickStatsCard } from "../components/dashboard/QuickStatsCard";
import { AppConnectivityCard } from "../components/settings/AppConnectivityCard";
import { DashboardLoader } from "../components/loaders/DashboardLoader";
import { ErrorState } from "../components/common/ErrorState";

export const Dashboard: React.FC = () => {
    // Fetch base data
    const {
        data: stats,
        isLoading: statsLoading,
        error,
    } = useDashboardStats() as {
        data: import("../api/dashboard").DashboardStats | undefined;
        isLoading: boolean;
        error: Error | null;
    };

    const { isEmbedded, isLoading: extensionsLoading } = useAppExtensions();
    const loading = statsLoading || extensionsLoading;

    // Logic handled by custom hook
    const {
        selectedPeriod,
        handlePeriodChange,
        periodOptions,
        currentStats,
        steps,
        progressInfo
    } = useDashboardFilters(stats);

    const isAppEnabled = isEmbedded ?? false;
    const deepLinkUrl = stats?.deepLinkUrl || "shopify:admin/themes/current/editor?context=apps";

    if (loading) {
        return <DashboardLoader />;
    }

    if (error) {
        return (
            <ErrorState 
                title="Dashboard"
                message="Failed to load dashboard statistics. Please try again later."
                onRetry={() => window.location.reload()}
            />
        );
    }

    return (
        <Page
            title="Welcome to Merchant Quote"
            subtitle="Merchant Quote - Solution for all your quote demand."
        >
            <Layout>
                <Layout.Section>
                    <BlockStack gap="400">
                        {/* 1. Analytics Section */}
                        <AnalyticsSection
                            periodOptions={periodOptions}
                            selectedPeriod={selectedPeriod}
                            onPeriodChange={handlePeriodChange}
                            currentStats={currentStats}
                            allTimeStats={{
                                totalQuotes: stats?.totalQuotes || 0,
                                convertedQuotes: stats?.convertedQuotes || 0,
                                yearAmount: stats?.analytics?.thisYear?.amount || 0
                            }}
                        />

                        {/* 2. Onboarding Section */}
                        <GettingStarted
                            steps={steps}
                            progress={progressInfo.progress}
                            completedCount={progressInfo.completedSteps}
                            totalCount={progressInfo.totalSteps}
                            deepLinkUrl={deepLinkUrl}
                            isAppEnabled={isAppEnabled}
                        />
                    </BlockStack>
                </Layout.Section>

                <Layout.Section variant="oneThird">
                    <BlockStack gap="400">
                        {/* 3. Status Section */}
                        <AppConnectivityCard
                            isAppEnabled={isAppEnabled}
                            deepLinkUrl={deepLinkUrl}
                            loading={loading}
                        />

                        {/* 4. Quick Summary Section */}
                        <QuickStatsCard
                            totalQuotes={stats?.totalQuotes || 0}
                            convertedQuotes={stats?.convertedQuotes || 0}
                        />
                    </BlockStack>
                </Layout.Section>
            </Layout>
        </Page>
    );
};
