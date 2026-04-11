import React from "react";
import { AlertCircleIcon } from "@shopify/polaris-icons";
import {
    BlockStack,
    Button,
    Card,
    Icon,
    Layout,
    Page,
    SkeletonBodyText,
    SkeletonPage,
    Text,
} from "@shopify/polaris";
import { StatsLoader } from "../components/loaders/StatsLoader";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { useAppExtensions } from "../hooks/useAppExtensions";
import { useDashboardFilters } from "../hooks/useDashboardFilters";

// Sub-components
import { AnalyticsSection } from "../components/dashboard/AnalyticsSection";
import { GettingStarted } from "../components/dashboard/GettingStarted";
import { QuickStatsCard } from "../components/dashboard/QuickStatsCard";
import { AppConnectivityCard } from "../components/settings/AppConnectivityCard";

export const Dashboard: React.FC = () => {
    // Fetch base data
    const {
        data: stats,
        isLoading: statsLoading,
        error,
    } = useDashboardStats() as {
        data:
        | (import("../api/dashboard").DashboardStats & {
            isAppEmbedded: boolean;
            deepLinkUrl: string;
            activeThemeId: string;
        })
        | undefined;
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
        return (
            <SkeletonPage title="Dashboard">
                <Layout>
                    <Layout.Section>
                        <Card>
                            <SkeletonBodyText lines={3} />
                        </Card>
                        <StatsLoader columns={4} />
                    </Layout.Section>
                    <Layout.Section variant="oneThird">
                        <Card padding="400">
                            <SkeletonBodyText lines={5} />
                        </Card>
                    </Layout.Section>
                </Layout>
            </SkeletonPage>
        );
    }

    if (error) {
        return (
            <Page title="Dashboard">
                <Layout>
                    <Layout.Section>
                        <Card padding="400">
                            <BlockStack gap="400" align="center" inlineAlign="center">
                                <Icon source={AlertCircleIcon} tone="critical" />
                                <Text as="p" tone="critical">
                                    Failed to load dashboard statistics. Please try again later.
                                </Text>
                                <Button onClick={() => window.location.reload()}>Retry</Button>
                            </BlockStack>
                        </Card>
                    </Layout.Section>
                </Layout>
            </Page>
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
