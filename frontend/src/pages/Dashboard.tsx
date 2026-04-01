import React, { useState } from 'react';
import {
    Page,
    Layout,
    Card,
    BlockStack,
    Text,
    Badge,
    Icon,
    Box,
    InlineStack,
    Banner,
    Button,
    Divider,
    SkeletonBodyText,
    SkeletonPage,
    Grid
} from '@shopify/polaris';
import {
    ProductIcon,
    OrderIcon,
    PlanIcon,
    CalendarIcon,
    CheckIcon
} from '@shopify/polaris-icons';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { usePlanUsage } from '../hooks/usePlanUsage';
import { useNavigate } from 'react-router-dom';
import { StatsLoader } from '../components/loaders/StatsLoader';

export const Dashboard: React.FC = () => {
    const { data: stats, isLoading: statsLoading, error } = useDashboardStats();
    const { usage, isLoading: planLoading } = usePlanUsage();
    const navigate = useNavigate();
    const [showPromo, setShowPromo] = useState(true);

    const loading = statsLoading || planLoading;
    const isFreeMode = usage?.isPaidApp === false;

    if (loading) {
        return (
            <SkeletonPage title="Dashboard">
                <Layout>
                    <Layout.Section>
                        <Card>
                            <SkeletonBodyText lines={3} />
                        </Card>
                    </Layout.Section>
                    <Layout.Section>
                        <StatsLoader columns={4} />
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
                        <Banner tone="critical" title="Connection error">
                            <p>Failed to load dashboard statistics. Please try again later.</p>
                        </Banner>
                    </Layout.Section>
                </Layout>
            </Page>
        );
    }

    const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: any; color?: any }) => (
        <Card>
            <BlockStack gap="200">
                <InlineStack align="space-between">
                    <Text as="h2" variant="headingSm" tone="subdued">
                        {title}
                    </Text>
                    <Box padding="100" borderRadius="200">
                        <Icon source={icon} tone={color || "base"} />
                    </Box>
                </InlineStack>
                <Text as="p" variant="headingLg">
                    {value}
                </Text>
            </BlockStack>
        </Card>
    );

    return (
        <Page title="Dashboard">
            <Box paddingBlockEnd="800">
                <Layout>
                    {/* Onboarding / Setup Guide */}
                    <Layout.Section>
                        <Card>
                            <BlockStack gap="400">
                                <BlockStack gap="100">
                                    <Text as="h2" variant="headingMd">Getting started</Text>
                                    <Text as="p" variant="bodyMd" tone="subdued">
                                        Complete these steps to start receiving and managing quotes efficiently.
                                    </Text>
                                </BlockStack>

                                <BlockStack gap="300">
                                    <InlineStack gap="400" blockAlign="center">
                                        <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Icon source={CheckIcon} tone="success" />
                                        </div>
                                        <BlockStack gap="0">
                                            <Text as="span" variant="bodyMd" fontWeight="semibold">Install and activate the app</Text>
                                            <Text as="span" variant="bodySm" tone="subdued">You're already here!</Text>
                                        </BlockStack>
                                    </InlineStack>

                                    <Divider />

                                    <InlineStack gap="400" blockAlign="center" align="space-between">
                                        <InlineStack gap="400" blockAlign="center">
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--p-color-border-brand)', boxSizing: 'border-box' }} />
                                            <BlockStack gap="0">
                                                <Text as="span" variant="bodyMd">Customize your Quote Form</Text>
                                                <Text as="span" variant="bodySm" tone="subdued">Adjust fields to gather the right info.</Text>
                                            </BlockStack>
                                        </InlineStack>
                                        <Button variant="plain" onClick={() => navigate('/form-builder')}>Configure form</Button>
                                    </InlineStack>

                                    <Divider />

                                    <InlineStack gap="400" blockAlign="center" align="space-between">
                                        <InlineStack gap="400" blockAlign="center">
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--p-color-border-brand)', boxSizing: 'border-box' }} />
                                            <BlockStack gap="0">
                                                <Text as="span" variant="bodyMd">Configure button visibility</Text>
                                                <Text as="span" variant="bodySm" tone="subdued">Decide which products show the quote button.</Text>
                                            </BlockStack>
                                        </InlineStack>
                                        <Button variant="plain" onClick={() => navigate('/settings')}>Go to settings</Button>
                                    </InlineStack>
                                </BlockStack>
                            </BlockStack>
                        </Card>
                    </Layout.Section>

                    {/* Performance Stats */}
                    <Layout.Section>
                        <StatsLoader columns={4} />
                    </Layout.Section>

                    {!loading && (
                        <Layout.Section>
                            <Grid>
                                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
                                    <StatCard
                                        title="Total Quotes"
                                        value={stats?.totalQuotes ?? 0}
                                        icon={ProductIcon}
                                        color="info"
                                    />
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
                                    <StatCard
                                        title="Converted Quotes"
                                        value={stats?.convertedQuotes ?? 0}
                                        icon={OrderIcon}
                                        color="success"
                                    />
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
                                    <StatCard
                                        title="Current Plan"
                                        value={isFreeMode ? "Free (Unlocked)" : (stats?.currentPlan ?? "Free")}
                                        icon={PlanIcon}
                                        color="warning"
                                    />
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
                                    <StatCard
                                        title="Days Remaining"
                                        value={isFreeMode ? "∞" : (stats?.daysRemaining ?? 0)}
                                        icon={CalendarIcon}
                                        color="critical"
                                    />
                                </Grid.Cell>
                            </Grid>
                        </Layout.Section>
                    )}

                    <Layout.Section>
                        <Card>
                            <BlockStack gap="400">
                                <Text as="h2" variant="headingMd">
                                    Account Overview
                                </Text>
                                <Text as="p" variant="bodyMd">
                                    You have converted <Text as="span" fontWeight="bold">{((stats?.convertedQuotes ?? 0) / (stats?.totalQuotes || 1) * 100).toFixed(1)}%</Text> of your quotes into draft orders.
                                    {isFreeMode ? (
                                        <> Your app is completely unlocked and <b>free</b> to use.</>
                                    ) : (
                                        <> Your current plan is <Badge tone={stats?.currentPlan === 'PRO' ? 'success' : 'info'}>{stats?.currentPlan}</Badge>.</>
                                    )}
                                </Text>
                            </BlockStack>
                        </Card>
                    </Layout.Section>

                    {/* Promotional Upsell at the bottom */}
                    {showPromo && !isFreeMode && stats?.currentPlan !== 'PRO' && stats?.currentPlan !== 'ULTIMATE' && (
                        <Layout.Section>
                            <Banner
                                onDismiss={() => setShowPromo(false)}
                                tone="info"
                                title="Unlock advanced features with the Pro Plan"
                                action={{
                                    content: 'Upgrade now',
                                    onAction: () => navigate('/plans')
                                }}
                            >
                                <p>Upgrade to Pro and get up to 10,000 quotes per month, custom branding, and wholesale draft order support.</p>
                            </Banner>
                        </Layout.Section>
                    )}
                </Layout>
            </Box>
        </Page>
    );
};
