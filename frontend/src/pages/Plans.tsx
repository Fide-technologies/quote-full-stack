import React from 'react';
import {
    Page,
    Layout,
    Text,
    InlineStack,
    Box,
    Icon,
    Link,
    FooterHelp
} from '@shopify/polaris';
import { EmailIcon } from "@shopify/polaris-icons";
import { TitleBar } from '@shopify/app-bridge-react';

// Components
import { TransactionHistory } from '../components/plans/TransactionHistory';
import { PageLoader } from '../components/loaders/PageLoader';
import { ErrorState } from '../components/common/ErrorState';
import { PlansBanners } from '../components/plans/PlansBanners';
import { PlansGrid } from '../components/plans/PlansGrid';

// Hooks
import { usePlansLogic } from '../hooks/usePlansLogic';

export const Plans: React.FC = () => {
    const {
        currentPlanData,
        plans,
        currentPlanName,
        isLoading,
        isError,
        error,
        refetch,
        upgradeMutation,
        handleUpgrade,
        upgradeError,
        showSuccessBanner,
        setShowSuccessBanner,
        showErrorBanner,
        setShowErrorBanner,
        setUpgradeError
    } = usePlansLogic();

    if (isLoading) return <PageLoader title="Pricing Plans" />;

    if (isError) {
        return (
            <ErrorState
                title="Pricing Plans"
                message={(error as Error)?.message || "Failed to load plan information."}
                onRetry={() => refetch()}
            />
        );
    }

    const isPaidApp = currentPlanData?.isPaidApp !== false;

    return (
        <Page title="Pricing Plans">
            <TitleBar title="Pricing Plans" />
            <Box paddingBlockEnd="800">
                <Layout>
                    <PlansBanners
                        showSuccessBanner={showSuccessBanner}
                        onDismissSuccess={() => setShowSuccessBanner(false)}
                        showErrorBanner={showErrorBanner}
                        onDismissError={() => setShowErrorBanner(false)}
                        upgradeError={upgradeError}
                        onDismissUpgradeError={() => setUpgradeError(null)}
                    />

                    <PlansGrid
                        isPaidApp={isPaidApp}
                        plans={plans}
                        currentPlanName={currentPlanName}
                        isUpgrading={upgradeMutation.isPending}
                        upgradingPlanId={upgradeMutation.variables as string | undefined}
                        onUpgrade={handleUpgrade}
                    />

                    {isPaidApp && (
                        <Layout.Section>
                            <TransactionHistory />
                        </Layout.Section>
                    )}
                </Layout>
            </Box>
            <FooterHelp>
                <InlineStack gap="100" align="center" blockAlign="center">
                    <Icon source={EmailIcon} tone="base" />
                    <Text as="span">Have questions about our plans? <Link url="/support">Contact Support</Link></Text>
                </InlineStack>
            </FooterHelp>
        </Page>
    );
};
