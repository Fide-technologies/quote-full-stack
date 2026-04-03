import React, { useState, useEffect } from 'react';
import { 
    Page, 
    Layout, 
    Card, 
    BlockStack, 
    Text, 
    Button, 
    InlineStack, 
    Badge, 
    Banner, 
    Box, 
    Icon, 
    Divider, 
    Link, 
    InlineGrid, 
    FooterHelp
} from '@shopify/polaris';
import { CheckIcon, XIcon } from "@shopify/polaris-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentPlan, upgradePlan } from "../api/plans";
import { TitleBar } from '@shopify/app-bridge-react';
import planData from '../data/plans.json';
import { TransactionHistory } from '../components/plans/TransactionHistory';
import { PageLoader } from '../components/loaders/PageLoader';

interface Feature {
    text: string;
    included: boolean;
    bold?: boolean;
    highlighted?: boolean;
}

interface Plan {
    id: string;
    name: string;
    price: string;
    period: string;
    description: string;
    isPopular?: boolean;
    trialDays?: number;
    features: Feature[];
}

export const Plans: React.FC = () => {
    const queryClient = useQueryClient();
    const [upgradeError, setUpgradeError] = useState<string | null>(null);
    
    // Initialize banners directly from URL to avoid set-state-in-effect issues
    const urlParams = new URL(window.location.href).searchParams;
    const billingStatus = urlParams.get('billing');
    
    const [showSuccessBanner, setShowSuccessBanner] = useState(billingStatus === 'success');
    const [showErrorBanner, setShowErrorBanner] = useState(billingStatus === 'error');

    const { data: currentPlanData, isLoading } = useQuery({
        queryKey: ["currentPlan"],
        queryFn: getCurrentPlan,
    });

    const cleanBillingParam = () => {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('billing');
        window.history.replaceState({}, '', newUrl.toString());
    };

    useEffect(() => {
        if (billingStatus === 'success') {
            queryClient.invalidateQueries({ queryKey: ["currentPlan"] });
            // App Bridge toast might be handled here since it's a pure side effect
            // We only show it once per billingStatus change
            if (typeof shopify !== 'undefined') shopify.toast.show("✓ Plan upgraded successfully!");
        }
        
        if (billingStatus) {
            cleanBillingParam();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [billingStatus]);

    const upgradeMutation = useMutation({
        mutationFn: async (planName: string) => {
            const params = new URLSearchParams(window.location.search);
            let host = params.get("host");
            if (!host) host = sessionStorage.getItem("shopify_host") || sessionStorage.getItem("host");
            return upgradePlan(planName, host || "");
        },
        onSuccess: (data: { data?: { confirmationUrl?: string }; confirmationUrl?: string }) => {
            const confirmationUrl = data.data?.confirmationUrl || data.confirmationUrl;
            if (confirmationUrl) {
                if (window.top) {
                    window.top.location.href = confirmationUrl;
                } else {
                    window.location.href = confirmationUrl;
                }
            }
        },
        onError: (error: Error) => {
            setUpgradeError(error.message || "An unknown error occurred during upgrade.");
            if (typeof shopify !== 'undefined') shopify.toast.show("Upgrade failed", { isError: true });
        }
    });

    const handleUpgrade = (planName: string) => {
        setUpgradeError(null);
        upgradeMutation.mutate(planName);
    };

    if (isLoading) {
        return <PageLoader title="Pricing Plans" />;
    }

    const currentPlanName = currentPlanData?.plan?.name || 'FREE';
    const plans = planData as unknown as Plan[];

    return (
        <Page title="Pricing Plans">
            <TitleBar title="Pricing Plans" />
            <Box paddingBlockEnd="800">
                <Layout>
                    {showSuccessBanner && (
                        <Layout.Section>
                            <Banner 
                                tone="success" 
                                onDismiss={() => setShowSuccessBanner(false)}
                                title="Plan updated"
                            >
                                <p>Your plan has been updated successfully. New features are now available.</p>
                            </Banner>
                        </Layout.Section>
                    )}

                    {showErrorBanner && (
                        <Layout.Section>
                            <Banner 
                                tone="critical" 
                                onDismiss={() => setShowErrorBanner(false)}
                                title="Upgrade failed"
                            >
                                <p>Could not process your plan upgrade. Please try again or contact support.</p>
                            </Banner>
                        </Layout.Section>
                    )}

                    {upgradeError && (
                        <Layout.Section>
                            <Banner tone="critical" title="Upgrade Error">
                                <p>{upgradeError}</p>
                            </Banner>
                        </Layout.Section>
                    )}

                    {currentPlanData?.isPaidApp === false ? (
                        <Layout.Section>
                            <Card padding="800">
                                <BlockStack gap="400" align="center" inlineAlign="center">
                                    <Box paddingBlockEnd="400">
                                        <Text as="h2" variant="heading2xl" alignment="center">
                                            Merchant Quote is completely FREE 🎉
                                        </Text>
                                    </Box>
                                    <Text as="p" variant="bodyLg" alignment="center" tone="subdued">
                                        We're thrilled to offer you full access to the Merchant Quote platform without any subscriptions or credit card requirements. Enjoy all features with a massive quota of 10,000 completely free quotes every single month!
                                    </Text>
                                    <Box paddingBlockStart="400">
                                        <Button size="large" variant="primary" url="/">Go to Dashboard</Button>
                                    </Box>
                                </BlockStack>
                            </Card>
                        </Layout.Section>
                    ) : (
                        <Layout.Section>
                            <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
                                {plans.map((plan) => (
                                    <Card key={plan.id} padding="500">
                                        <BlockStack gap="400">
                                            <InlineStack align="space-between" blockAlign="center">
                                                <Text variant="headingLg" as="h2">{plan.name}</Text>
                                                {plan.isPopular && <Badge tone="attention">Popular</Badge>}
                                                {currentPlanName === plan.id && <Badge tone="success">Active</Badge>}
                                            </InlineStack>
                                            <Text variant="bodyMd" as="p" tone="subdued">{plan.description}</Text>
                                            
                                            <Box paddingBlock="400">
                                                <InlineStack align="start" blockAlign="end" gap="100">
                                                    <Text variant="heading2xl" as="p">{plan.price}</Text>
                                                    <Text variant="bodySm" as="p" tone="subdued">/{plan.period}</Text>
                                                </InlineStack>
                                                {plan.trialDays && (
                                                    <Text variant="bodySm" as="p" tone="success">{plan.trialDays} day free trial</Text>
                                                )}
                                            </Box>
                                            
                                            <Divider />
                                            
                                            <BlockStack gap="200">
                                                {plan.features.map((feature, fIdx) => (
                                                    <InlineStack key={fIdx} gap="200" blockAlign="center">
                                                        <Icon 
                                                            source={feature.included ? CheckIcon : XIcon} 
                                                            tone={feature.included ? "success" : "subdued"} 
                                                        />
                                                        <Text 
                                                            as="span" 
                                                            variant="bodyMd" 
                                                            fontWeight={feature.bold ? "bold" : "regular"}
                                                            tone={feature.included ? "base" : "subdued"}
                                                        >
                                                            {feature.text}
                                                        </Text>
                                                    </InlineStack>
                                                ))}
                                            </BlockStack>
                                            
                                            <Box paddingBlockStart="400">
                                                <Button 
                                                    fullWidth 
                                                    variant={plan.isPopular ? "primary" : "secondary"}
                                                    disabled={currentPlanName === plan.id || upgradeMutation.isPending}
                                                    loading={upgradeMutation.isPending && upgradeMutation.variables === plan.id}
                                                    onClick={() => handleUpgrade(plan.id)}
                                                >
                                                    {currentPlanName === plan.id ? 'Current Plan' : 'Select Plan'}
                                                </Button>
                                            </Box>
                                        </BlockStack>
                                    </Card>
                                ))}
                            </InlineGrid>
                        </Layout.Section>
                    )}
                    
                    {currentPlanData?.isPaidApp !== false && (
                        <Layout.Section>
                            <TransactionHistory />
                        </Layout.Section>
                    )}
                </Layout>
            </Box>
            <FooterHelp>
                Have questions about our plans? <Link url="/support">Contact Support</Link>
            </FooterHelp>
        </Page>
    );
};
