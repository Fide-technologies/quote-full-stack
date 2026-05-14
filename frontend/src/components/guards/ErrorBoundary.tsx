import { Component, type ErrorInfo, type ReactNode } from "react";
import { Page, Card, Layout, BlockStack, Text, Button, Box, Banner } from "@shopify/polaris";
import { AlertCircleIcon } from "@shopify/polaris-icons";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <Page>
                    <Layout>
                        <Layout.Section>
                            <Box paddingBlockStart="800">
                                <Card>
                                    <BlockStack gap="400">
                                        <Banner tone="critical" icon={AlertCircleIcon}>
                                            <Text variant="headingMd" as="h1">Something went wrong</Text>
                                        </Banner>
                                        <Text variant="bodyMd" as="p">
                                            The application encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
                                        </Text>
                                        {import.meta.env.MODE !== "production" && (
                                            <Box padding="400" background="bg-surface-secondary" borderRadius="200">
                                                <Text variant="bodySm" as="p" tone="subdued">
                                                    {this.state.error?.toString()}
                                                </Text>
                                            </Box>
                                        )}
                                        <Button onClick={() => window.location.reload()}>
                                            Reload Page
                                        </Button>
                                    </BlockStack>
                                </Card>
                            </Box>
                        </Layout.Section>
                    </Layout>
                </Page>
            );
        }

        return this.props.children;
    }
}
