import React, { useState, useEffect } from 'react';
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
    Button,
    SkeletonBodyText,
    SkeletonPage,
    ProgressBar,
    SkeletonDisplayText
} from '@shopify/polaris';
import {
    CalendarIcon,
    CheckIcon,
    QuestionCircleIcon,
    PersonIcon,
    AlertCircleIcon
} from '@shopify/polaris-icons';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useNavigate } from 'react-router-dom';
import { StatsLoader } from '../components/loaders/StatsLoader';

export const Dashboard: React.FC = () => {
    // Correctly define the DashboardStats type to include theme auditing properties
    const { data: stats, isLoading: statsLoading, error } = useDashboardStats() as {
        data: (import("../api/dashboard").DashboardStats & { 
            isAppEmbedded: boolean;
            deepLinkUrl: string;
            activeThemeId: string;
        }) | undefined;
        isLoading: boolean;
        error: Error | null
    };
    
    const navigate = useNavigate();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const loading = statsLoading;
    
    // Core Status: Physical check from theme assets
    const isAppEnabled = stats?.isAppEmbedded ?? false;
    const deepLinkUrl = stats?.deepLinkUrl || 'shopify:admin/themes/current/editor?context=apps';
    
    // Calculate progress based on dynamic stats and real-time status
    const steps = [
        { label: 'Install and activate the app', completed: true, description: "Successfully installed in your store" },
        { label: 'Customize your Quote Form', completed: stats?.totalQuotes ? stats.totalQuotes > 0 : false, description: "Adjust fields to gather the right info." },
        { label: 'Configure button visibility', completed: isAppEnabled === true, description: "Decide which products show the quote button." },
        { label: 'Receive your first quote', completed: stats?.totalQuotes ? stats.totalQuotes > 0 : false, description: "Wait for customers to start receiving quotes." }
    ];
    const completedSteps = steps.filter(s => s.completed).length;
    const progress = (completedSteps / steps.length) * 100;

    // Helper component for the Direct Session Link Button
    const ThemeEditorLink = ({ children, primary = false }: { children: string, primary?: boolean }) => (
        <a 
          href={deepLinkUrl} 
          target="_blank" 
          rel="opener noreferrer" 
          style={{ textDecoration: 'none', width: '100%' }}
        >
          <Button 
            variant={primary ? "primary" : undefined} 
            tone={primary && !isAppEnabled ? "success" : undefined}
            fullWidth
          >
            {children}
          </Button>
        </a>
    );

    if (!isClient || loading) {
        return (
            <SkeletonPage title="Dashboard">
                <Layout>
                    <Layout.Section>
                        <Card><SkeletonBodyText lines={3} /></Card>
                        <StatsLoader columns={4} />
                    </Layout.Section>
                    <Layout.Section variant="oneThird">
                        <Card padding="400"><SkeletonBodyText lines={5} /></Card>
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
                                <Text as="p" tone="critical">Failed to load dashboard statistics. Please try again later.</Text>
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
            secondaryActions={[{ content: 'English', icon: QuestionCircleIcon }]}
        >
            <Layout>
                <Layout.Section>
                    <BlockStack gap="400">
                        <Card padding="500">
                            <InlineStack gap="400" align="space-around">
                                <BlockStack gap="100">
                                    <Text as="p" variant="bodySm" tone="subdued">Last 7 days</Text>
                                    <Icon source={CalendarIcon} tone="subdued" />
                                </BlockStack>
                                <BlockStack gap="100">
                                    <Text as="p" variant="bodySm" tone="subdued">Total quote value</Text>
                                    <Text variant="headingMd" as="p">$0.00</Text>
                                </BlockStack>
                                <BlockStack gap="100">
                                    <Text as="p" variant="bodySm" tone="subdued">Total draft orders</Text>
                                    <Text variant="headingMd" as="p">{stats?.convertedQuotes || 0}</Text>
                                </BlockStack>
                                <BlockStack gap="100">
                                    <Text as="p" variant="bodySm" tone="subdued">Total quotes</Text>
                                    <Text variant="headingMd" as="p">{stats?.totalQuotes || 0}</Text>
                                </BlockStack>
                            </InlineStack>
                        </Card>

                        <Card>
                            <BlockStack gap="400">
                                <InlineStack align="space-between" blockAlign="center">
                                    <BlockStack gap="100">
                                      <Text variant="headingMd" as="h2">Getting started</Text>
                                      <Text as="p" variant="bodySm" tone="subdued">Complete these steps to start receiving quotes.</Text>
                                    </BlockStack>
                                    <Badge tone={progress === 100 ? "success" : "info"}>
                                        {`${completedSteps} of ${steps.length} tasks completed`}
                                    </Badge>
                                </InlineStack>
                                <ProgressBar progress={progress} size="small" tone="success" />
                                <BlockStack gap="300">
                                    {steps.map((step, idx) => (
                                        <InlineStack key={idx} gap="300" blockAlign="center" align="space-between">
                                            <InlineStack gap="300" blockAlign="center">
                                                <Box padding="100">
                                                    {step.completed ? (
                                                        <div style={{ color: 'var(--p-color-bg-fill-success)' }}>
                                                            <Icon source={CheckIcon} tone="success" />
                                                        </div>
                                                    ) : (
                                                        <div style={{ 
                                                            width: '20px', 
                                                            height: '20px', 
                                                            borderRadius: '50%', 
                                                            border: '2px solid var(--p-color-border-subdued)' 
                                                        }} />
                                                    )}
                                                </Box>
                                                <BlockStack gap="0">
                                                    <Text as="span" variant="bodyMd" fontWeight={step.completed ? "semibold" : "regular"}>{step.label}</Text>
                                                    <Text as="span" variant="bodySm" tone="subdued">{step.description}</Text>
                                                </BlockStack>
                                            </InlineStack>
                                            {!step.completed && (
                                                idx === 2 ? (
                                                    <ThemeEditorLink>Set up</ThemeEditorLink>
                                                ) : (
                                                    <Button variant="plain" onClick={() => navigate('/form-builder')}>Set up</Button>
                                                )
                                            )}
                                        </InlineStack>
                                    ))}
                                </BlockStack>
                            </BlockStack>
                        </Card>

                        <Card padding="400">
                            <InlineStack align="space-between" blockAlign="center">
                                <InlineStack gap="400" blockAlign="center">
                                    <Box padding="200" background="bg-fill-info" borderRadius="200">
                                        <Icon source={CheckIcon} tone="info" />
                                    </Box>
                                    <BlockStack gap="100">
                                        <Text variant="headingMd" as="h3">Advanced Notifications</Text>
                                        <Text variant="bodyMd" tone="subdued" as="p">Stay updated with email alerts for every new quote request.</Text>
                                    </BlockStack>
                                </InlineStack>
                                <Button variant="primary" onClick={() => navigate('/settings')}>Configure</Button>
                            </InlineStack>
                        </Card>
                    </BlockStack>
                </Layout.Section>

                <Layout.Section variant="oneThird">
                    <BlockStack gap="400">
                        <Card background={(!loading && isAppEnabled === false) ? "bg-surface-secondary-active" : "bg-surface"}>
                            <BlockStack gap="300">
                                {loading ? (
                                    <BlockStack gap="200">
                                        <SkeletonDisplayText size="small" />
                                        <SkeletonBodyText lines={2} />
                                    </BlockStack>
                                ) : (
                                    <>
                                        <BlockStack gap="100">
                                            <InlineStack align="space-between" blockAlign="center">
                                                <Text variant="headingSm" as="h3">App Connectivity</Text>
                                                <Badge tone={isAppEnabled ? "success" : "critical"}>
                                                    {isAppEnabled ? "Active" : "Disabled"}
                                                </Badge>
                                            </InlineStack>
                                            <Text as="p" variant="bodySm" tone="subdued">
                                                {isAppEnabled 
                                                    ? "Your app is currently live and visible on your storefront." 
                                                    : "The app is not visible to customers. Enable it to start receiving quotes."}
                                            </Text>
                                        </BlockStack>
                                        <ThemeEditorLink primary={true}>
                                            {isAppEnabled ? "Manage in Theme" : "Enable App Embed"}
                                        </ThemeEditorLink>
                                    </>
                                )}
                            </BlockStack>
                        </Card>

                        <Card>
                            <BlockStack gap="300">
                                <Text variant="headingMd" as="h3">Quick Analytics</Text>
                                <BlockStack gap="200">
                                    <InlineStack gap="200" blockAlign="center">
                                        <Box width="20px">
                                            <Icon source={PersonIcon} tone="subdued" />
                                        </Box>
                                        <Text as="span">Total Customer Requests: {stats?.totalQuotes || 0}</Text>
                                    </InlineStack>
                                    <InlineStack gap="200" blockAlign="center">
                                        <Box width="20px">
                                            <Icon source={CheckIcon} tone="subdued" />
                                        </Box>
                                        <Text as="span">Converted to Orders: {stats?.convertedQuotes || 0}</Text>
                                    </InlineStack>
                                </BlockStack>
                            </BlockStack>
                        </Card>
                    </BlockStack>
                </Layout.Section>
            </Layout>
        </Page>
    );
};
