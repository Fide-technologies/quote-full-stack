import React from "react";
import { Page, Layout, Card, BlockStack, Icon, Text, Button } from "@shopify/polaris";
import { AlertCircleIcon } from "@shopify/polaris-icons";

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    backAction?: { content: string; onAction: () => void };
}

export const ErrorState: React.FC<ErrorStateProps> = ({
    title = "Error",
    message = "Failed to load data. Please try again later.",
    onRetry,
    backAction,
}) => {
    return (
        <Page title={title} backAction={backAction}>
            <Layout>
                <Layout.Section>
                    <Card padding="400">
                        <BlockStack gap="400" align="center" inlineAlign="center">
                            <Icon source={AlertCircleIcon} tone="critical" />
                            <Text as="p" tone="critical">
                                {message}
                            </Text>
                            {onRetry && (
                                <Button onClick={onRetry}>Retry</Button>
                            )}
                        </BlockStack>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    );
};
