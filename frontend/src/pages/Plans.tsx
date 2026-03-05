import React, { useState } from 'react';
import { Page, Layout, Card, BlockStack, Text, Button, InlineStack, Badge, Banner, Box, Icon, Divider, Link, InlineGrid } from '@shopify/polaris';
import { CheckIcon, XIcon } from "@shopify/polaris-icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getCurrentPlan, upgradePlan } from "../api/plans";
import { useAppBridge } from '@shopify/app-bridge-react';
import planData from '../data/plans.json';

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
    const shopify = useAppBridge();
    const [upgradeError, setUpgradeError] = useState<string | null>(null);

    const { data: currentPlanData, isLoading } = useQuery({
        queryKey: ["currentPlan"],
        queryFn: getCurrentPlan
    });

    const upgradeMutation = useMutation({
        mutationFn: (planName: string) => upgradePlan(planName),
        onSuccess: (data: any) => {
            const url = data.data?.confirmationUrl || data.confirmationUrl;
            if (url) {
                (shopify as any).open(url, "_top");
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
            <Page>
                <Box paddingBlockStart="800">
                    <InlineStack align="center">
                        <Text as="p" variant="bodyMd">Loading plans...</Text>
                    </InlineStack>
                </Box>
            </Page>
        );
    }

    return (
        <Page>
            <Box paddingBlockEnd="800">
                <Layout>
                    {upgradeError && (
                        <Layout.Section>
                            <Banner tone="critical" onDismiss={() => setUpgradeError(null)}>
                                <p>{upgradeError}</p>
                            </Banner>
                        </Layout.Section>
                    )}

                    <Layout.Section>
                        <Box paddingBlockEnd="400" paddingBlockStart="400">
                            <BlockStack gap="200" align="center">
                                <Text as="h1" variant="heading2xl" alignment="center">Choose the right plan for your business</Text>
                                <Text as="p" variant="bodyLg" tone="subdued" alignment="center">
                                    Scale your quoting process with advanced automation and professional branding.
                                </Text>
                            </BlockStack>
                        </Box>
                    </Layout.Section>

                    <Layout.Section>
                        <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
                            {(planData as Plan[]).map((plan) => {
                                const isCurrent = currentPlanData?.name === plan.id;
                                return (
                                    <Box key={plan.id}>
                                        <Card padding="400" roundedAbove="sm">

                                            <BlockStack gap="400">
                                                <BlockStack gap="200">
                                                    <InlineStack align="space-between">
                                                        <BlockStack gap="100">
                                                            <Text as="h2" variant="headingLg" fontWeight={plan.isPopular ? "bold" : undefined}>
                                                                {plan.name}
                                                            </Text>
                                                            {plan.isPopular && <Badge tone="info">Popular</Badge>}
                                                        </BlockStack>
                                                    </InlineStack>
                                                    <Text as="p" variant="bodyMd" tone="subdued">{plan.description}</Text>
                                                </BlockStack>

                                                <BlockStack gap="100">
                                                    <InlineStack align="start" blockAlign="baseline" gap="100">
                                                        <Text as="span" variant="heading3xl" fontWeight={plan.price !== 'Free' ? 'bold' : undefined}>
                                                            {plan.price}
                                                        </Text>
                                                        <Text as="span" variant="bodyMd" tone="subdued">{plan.period}</Text>
                                                    </InlineStack>
                                                    {plan.trialDays && (
                                                        <Text as="p" variant="bodySm" tone="success" fontWeight="bold">
                                                            {plan.trialDays} DAY FREE TRIAL
                                                        </Text>
                                                    )}
                                                </BlockStack>

                                                <Button
                                                    variant={isCurrent ? "secondary" : (plan.isPopular ? 'primary' : 'secondary')}
                                                    fullWidth
                                                    size="large"
                                                    loading={upgradeMutation.isPending && upgradeMutation.variables === plan.id}
                                                    disabled={isCurrent}
                                                    onClick={() => handleUpgrade(plan.id)}
                                                >
                                                    {isCurrent ? "Current plan" : (plan.id === 'FREE' ? "Switch to Free" : `Upgrade to ${plan.name}`)}
                                                </Button>

                                                <Divider />

                                                <BlockStack gap="200">
                                                    {plan.features.map((feature, idx) => (
                                                        <InlineStack key={idx} wrap={false} gap="300">
                                                            <Box width="20px" opacity={!feature.included ? "0.3" : "1"}>
                                                                <Icon source={feature.included ? CheckIcon : XIcon} tone={feature.included ? "success" : "critical"} />
                                                            </Box>
                                                            <Box opacity={!feature.included ? "0.3" : "1"}>
                                                                <Text as="span" variant="bodyMd" fontWeight={feature.bold ? 'bold' : (feature.highlighted ? 'semibold' : undefined)} tone={feature.highlighted ? 'success' : undefined}>
                                                                    {feature.text}
                                                                </Text>
                                                            </Box>
                                                        </InlineStack>
                                                    ))}
                                                </BlockStack>
                                            </BlockStack>
                                        </Card>
                                    </Box>
                                );
                            })}
                        </InlineGrid>
                    </Layout.Section>


                    <Layout.Section>
                        <Box paddingBlockStart="400" paddingBlockEnd="400">
                            <BlockStack gap="200" align="center">
                                <Text as="p" variant="bodySm" tone="subdued" alignment="center">
                                    All recurring charges occur every 30 days in USD. Trial period is completely free.
                                </Text>
                                <Text as="p" variant="bodySm" tone="subdued" alignment="center">
                                    Have questions? <Link url="mailto:krishnauday320@gmail.com" monochrome>Contact our support team</Link>
                                </Text>
                            </BlockStack>
                        </Box>
                    </Layout.Section>
                </Layout>
            </Box>
        </Page>
    );
};
