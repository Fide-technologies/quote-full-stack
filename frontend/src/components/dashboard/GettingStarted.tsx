import React from 'react';
import { Card, BlockStack, InlineStack, Text, Badge, ProgressBar, Box, Icon, Button } from '@shopify/polaris';
import { CheckIcon } from '@shopify/polaris-icons';
import { useNavigate } from 'react-router-dom';

interface OnboardingStep {
    label: string;
    completed: boolean;
    description: string;
}

interface GettingStartedProps {
    steps: OnboardingStep[];
    progress: number;
    completedCount: number;
    totalCount: number;
    deepLinkUrl: string;
    isAppEnabled: boolean;
}

const ThemeEditorLink: React.FC<{ children: string; deepLinkUrl: string }> = ({ children, deepLinkUrl }) => (
    <a href={deepLinkUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
        <Button size="slim">{children}</Button>
    </a>
);

export const GettingStarted: React.FC<GettingStartedProps> = ({
    steps,
    progress,
    completedCount,
    totalCount,
    deepLinkUrl,
}) => {
    const navigate = useNavigate();

    return (
        <Card>
            <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                    <BlockStack gap="100">
                        <Text variant="headingMd" as="h2">Getting started</Text>
                        <Text as="p" variant="bodySm" tone="subdued">Complete these steps to start receiving quotes.</Text>
                    </BlockStack>
                    <Badge tone={progress === 100 ? "success" : "info"}>
                        {`${completedCount} of ${totalCount} tasks completed`}
                    </Badge>
                </InlineStack>
                <ProgressBar progress={progress} size="small" tone="success" />
                <BlockStack gap="300">
                    {steps.map((step, idx) => (
                        <InlineStack key={idx} gap="300" blockAlign="center" align="space-between">
                            <InlineStack gap="300" blockAlign="center">
                                <Box padding="100">
                                    {step.completed ? (
                                        <div style={{ color: "var(--p-color-bg-fill-success)" }}>
                                            <Icon source={CheckIcon} tone="success" />
                                        </div>
                                    ) : (
                                        <div style={{
                                            width: "20px",
                                            height: "20px",
                                            borderRadius: "50%",
                                            border: "2px solid var(--p-color-border-subdued)",
                                        }} />
                                    )}
                                </Box>
                                <BlockStack gap="0">
                                    <Text as="span" variant="bodyMd" fontWeight={step.completed ? "semibold" : "regular"}>
                                        {step.label}
                                    </Text>
                                    <Text as="span" variant="bodySm" tone="subdued">{step.description}</Text>
                                </BlockStack>
                            </InlineStack>
                            {!step.completed && (
                                idx === 2 ? (
                                    <ThemeEditorLink deepLinkUrl={deepLinkUrl}>Set up</ThemeEditorLink>
                                ) : (
                                    <Button variant="plain" onClick={() => navigate("/form-builder")}>Set up</Button>
                                )
                            )}
                        </InlineStack>
                    ))}
                </BlockStack>
            </BlockStack>
        </Card>
    );
};
