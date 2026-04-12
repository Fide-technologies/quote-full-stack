import React from 'react';
import {
    Card,
    BlockStack,
    Text,
    Button,
    InlineStack,
    Badge,
    Box,
    Icon,
    Divider
} from '@shopify/polaris';
import { CheckIcon, XIcon } from "@shopify/polaris-icons";
import type { Plan } from '@/types/plans';

interface PlanCardProps {
    plan: Plan;
    currentPlanName: string;
    isUpgrading: boolean;
    upgradingPlanId: string | undefined;
    onUpgrade: (planId: string) => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({
    plan,
    currentPlanName,
    isUpgrading,
    upgradingPlanId,
    onUpgrade
}) => {
    const isActive = currentPlanName === plan.id;
    const isThisPlanUpgrading = isUpgrading && upgradingPlanId === plan.id;

    return (
        <Card padding="500">
            <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                    <Text variant="headingLg" as="h2">{plan.name}</Text>
                    <InlineStack gap="200">
                        {plan.isPopular && <Badge tone="attention">Popular</Badge>}
                        {isActive && <Badge tone="success">Active</Badge>}
                    </InlineStack>
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
                        disabled={isActive || isUpgrading}
                        loading={isThisPlanUpgrading}
                        onClick={() => onUpgrade(plan.id)}
                    >
                        {isActive ? 'Current Plan' : 'Select Plan'}
                    </Button>
                </Box>
            </BlockStack>
        </Card>
    );
};
