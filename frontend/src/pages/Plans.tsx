import React, { useState } from 'react';
import { Page, Layout, Card, BlockStack, Text, Button, InlineStack, Badge, Banner, Box, Icon, Divider, Link } from '@shopify/polaris';
import { CheckIcon, XIcon } from "@shopify/polaris-icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getCurrentPlan, upgradePlan } from "../api/plans";
import { useAppBridge } from '@shopify/app-bridge-react';

export const Plans: React.FC = () => {
    const shopify = useAppBridge();
    const [upgradeError, setUpgradeError] = useState<string | null>(null);

    const { data: currentPlanData, isLoading } = useQuery({
        queryKey: ["currentPlan"],
        queryFn: getCurrentPlan
    });

    const isPro = currentPlanData?.name === "PRO";

    const upgradeMutation = useMutation({
        mutationFn: (planName: string) => upgradePlan(planName),
        onSuccess: (data: any) => {
            if (data.data?.confirmationUrl) {
                window.open(data.data.confirmationUrl, "_top");
            } else if (data.confirmationUrl) {
                window.open(data.confirmationUrl, "_top");
            }
        },
        onError: (error: any) => {
            setUpgradeError(error.message);
            shopify.toast.show("Upgrade failed", { isError: true });
        }
    });

    const handleUpgrade = (planName: string) => {
        setUpgradeError(null);
        upgradeMutation.mutate(planName);
    };

    if (isLoading) {
        return (
            <Page title="Plans & billing">
                <Layout>
                    <Layout.Section>
                        <Card>
                            <BlockStack gap="400">
                                <Text as="p" variant="bodyMd">Loading plan details...</Text>
                            </BlockStack>
                        </Card>
                    </Layout.Section>
                </Layout>
            </Page>
        );
    }

    return (
        <Page title="Plans & billing">
            <Layout>
                {upgradeError && (
                    <Layout.Section>
                        <Banner tone="critical" onDismiss={() => setUpgradeError(null)}>
                            <p>{upgradeError}</p>
                        </Banner>
                    </Layout.Section>
                )}

                <Layout.Section>
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4 items-start">
                        {/* Starter Plan */}
                        <Box width="100%">
                            <Card>
                                <BlockStack gap="500">
                                    <BlockStack gap="200">
                                        <Text as="h2" variant="headingLg">Starter</Text>
                                        <Text as="p" variant="bodyMd" tone="subdued">
                                            Essential features for small businesses just getting started.
                                        </Text>
                                        <Text as="h3" variant="heading2xl">Free</Text>
                                    </BlockStack>

                                    <Divider />

                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-start gap-3">
                                            <Icon source={CheckIcon} tone="base" />
                                            <Text as="span" variant="bodyMd">50 quotes / month</Text>
                                        </div>
                                        <div className="flex items-center justify-start gap-3">
                                            <Icon source={CheckIcon} tone="base" />
                                            <Text as="span" variant="bodyMd">Basic email notifications</Text>
                                        </div>
                                        <div className="flex items-center justify-start gap-3">
                                            <Icon source={XIcon} tone="critical" />
                                            <Text as="span" variant="bodyMd" tone="subdued">Corporate branding</Text>
                                        </div>
                                        <div className="flex items-center justify-start gap-3">
                                            <Icon source={XIcon} tone="critical" />
                                            <Text as="span" variant="bodyMd" tone="subdued">Priority support</Text>
                                        </div>
                                    </div>

                                    <Box paddingBlockStart="200">
                                        <Button
                                            fullWidth
                                            size="large"
                                            disabled={!isPro}
                                            variant="secondary"
                                            onClick={() => { }} // Downgrade logic if needed
                                        >
                                            {isPro ? "Switch to Starter" : "Current plan"}
                                        </Button>
                                    </Box>
                                </BlockStack>
                            </Card>
                        </Box>

                        {/* Pro Plan */}
                        <Box width="100%" position="relative">
                            <div className="absolute -top-3 right-4 z-[1]">
                                <Badge tone="success">Most popular</Badge>
                            </div>
                            <div className="border-2 border-[var(--p-color-border-emphasis)] rounded-[var(--p-border-radius-300)] overflow-hidden">
                                <Card>
                                    <BlockStack gap="500">
                                        <BlockStack gap="200">
                                            <InlineStack align="space-between" blockAlign="center">
                                                <Text as="h2" variant="headingLg">Pro</Text>
                                            </InlineStack>
                                            <Text as="p" variant="bodyMd" tone="subdued">
                                                Advanced tools to scale your quoting operations.
                                            </Text>
                                            <InlineStack blockAlign="baseline" gap="100">
                                                <Text as="h3" variant="heading2xl">$29.99</Text>
                                                <Text as="span" variant="bodyMd" tone="subdued">/ month</Text>
                                            </InlineStack>
                                        </BlockStack>

                                        <Divider />

                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center justify-start gap-3">
                                                <Icon source={CheckIcon} tone="success" />
                                                <Text as="span" variant="bodyMd" fontWeight="semibold">Unlimited quotes</Text>
                                            </div>
                                            <div className="flex items-center justify-start gap-3">
                                                <Icon source={CheckIcon} tone="success" />
                                                <Text as="span" variant="bodyMd" fontWeight="semibold">No branding</Text>
                                            </div>
                                            <div className="flex items-center justify-start gap-3">
                                                <Icon source={CheckIcon} tone="success" />
                                                <Text as="span" variant="bodyMd" fontWeight="semibold">Priority support</Text>
                                            </div>
                                            <div className="flex items-center justify-start gap-3">
                                                <Icon source={CheckIcon} tone="success" />
                                                <Text as="span" variant="bodyMd" fontWeight="semibold">Custom email templates</Text>
                                            </div>
                                        </div>

                                        <Box paddingBlockStart="200">
                                            <Button
                                                variant="primary"
                                                fullWidth
                                                size="large"
                                                loading={upgradeMutation.isPending}
                                                disabled={isPro}
                                                onClick={() => handleUpgrade("PRO")}
                                            >
                                                {isPro ? "Active plan" : "Upgrade to Pro"}
                                            </Button>
                                        </Box>
                                    </BlockStack>
                                </Card>
                            </div>
                        </Box>
                    </div>
                </Layout.Section>

                <Layout.Section>
                    <Box paddingBlockStart="800">
                        <BlockStack gap="200" align="center">
                            <Text as="p" variant="bodySm" tone="subdued" alignment="center">
                                All charges are billed in USD. Recurring charges are billed every 30 days.
                            </Text>
                            <Text as="p" variant="bodySm" tone="subdued" alignment="center">
                                Need help? <Link url="mailto:support@example.com">Contact support</Link>
                            </Text>
                        </BlockStack>
                    </Box>
                </Layout.Section>
            </Layout>
        </Page>
    );
};
