import { 
    Page, 
    Layout, 
    BlockStack, 
    Text, 
    Box, 
    Card, 
    Banner, 
    SkeletonPage, 
    SkeletonBodyText, 
    InlineStack, 
    Badge, 
    Link,
    Divider
} from "@shopify/polaris";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings, updateSettings } from "../api/settings";
import { GlobalSettingsCard } from "../components/settings/GlobalSettingsCard";
import { useAppBridge, SaveBar } from "@shopify/app-bridge-react";
import { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";

export const Settings: React.FC = () => {
    const queryClient = useQueryClient();
    const shopify = useAppBridge();
    
    // Local state to track unsaved changes
    const [localShowOnAll, setLocalShowOnAll] = useState<boolean | null>(null);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["settings"],
        queryFn: getSettings,
    });

    // Sync local state when data is loaded
    useEffect(() => {
        if (data && localShowOnAll === null) {
            setLocalShowOnAll(data.showOnAll);
        }
    }, [data]);

    const mutation = useMutation({
        mutationFn: updateSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings"] });
            shopify.toast.show("Settings saved successfully");
            setLocalShowOnAll(null); // Reset local state to sync with fresh data
        },
        onError: () => {
            shopify.toast.show("Failed to save settings", { isError: true });
        }
    });

    // Check if form is dirty
    const isDirty = localShowOnAll !== null && localShowOnAll !== data?.showOnAll;

    const handleSave = () => {
        if (localShowOnAll !== null) {
            mutation.mutate(localShowOnAll);
        }
    };

    const handleDiscard = () => {
        setLocalShowOnAll(data?.showOnAll ?? true);
    };

    if (isLoading) {
        return (
            <SkeletonPage title="Settings">
                <Layout>
                    <Layout.Section>
                        <Card>
                            <BlockStack gap="400">
                                <SkeletonBodyText lines={3} />
                            </BlockStack>
                        </Card>
                    </Layout.Section>
                </Layout>
            </SkeletonPage>
        );
    }

    return (
        <Page
            title="Settings"
            subtitle="Manage your quote request configuration and appearance."
        >
            {isDirty && (
                <SaveBar id="settings-save-bar">
                    <button variant="primary" onClick={handleSave}>Save</button>
                    <button onClick={handleDiscard}>Discard</button>
                </SaveBar>
            )}

            <Layout>
                {isError && (
                    <Layout.Section>
                        <Banner tone="critical" title="Error loading settings">
                            <p>{(error as Error)?.message || "Something went wrong while fetching your settings."}</p>
                        </Banner>
                    </Layout.Section>
                )}

                <Layout.AnnotatedSection
                    title="General Configuration"
                    description="Configure how the quote request button appears on your storefront."
                >
                    <Card>
                        <BlockStack gap="400">
                            <GlobalSettingsCard
                                showOnAll={localShowOnAll ?? data?.showOnAll ?? true}
                                onShowOnAllChange={setLocalShowOnAll}
                                disabled={mutation.isPending}
                            />
                        </BlockStack>
                    </Card>
                </Layout.AnnotatedSection>

                <Layout.AnnotatedSection
                    title="Quote Behavior"
                    description="Automatic actions taken when a quote is requested."
                >
                    <Card>
                        <BlockStack gap="400">
                            <Box>
                                <InlineStack align="space-between">
                                    <BlockStack gap="100">
                                        <Text variant="bodyMd" fontWeight="semibold" as="span">Hide Prices</Text>
                                        <Text variant="bodySm" tone="subdued" as="p">
                                            Prices are automatically hidden for all products when the quote button is enabled.
                                        </Text>
                                    </BlockStack>
                                    <Badge tone="info">Always Active</Badge>
                                </InlineStack>
                            </Box>
                        </BlockStack>
                    </Card>
                </Layout.AnnotatedSection>

                <Layout.AnnotatedSection
                    title="Support & Legal"
                    description="Get help or view our policies."
                >
                    <Card>
                        <BlockStack gap="400">
                            <BlockStack gap="200">
                                <Text as="h3" variant="headingSm">Need help?</Text>
                                <Text as="p" variant="bodyMd" tone="subdued">
                                    If you have any questions or need assistance with the app, please contact our support team.
                                </Text>
                                <Box>
                                    <Link url="mailto:krishnauday320@gmail.com" external>
                                        Contact Support
                                    </Link>
                                </Box>
                            </BlockStack>
                            
                            <Divider />

                            <BlockStack gap="200">
                                <Text as="h3" variant="headingSm">Legal</Text>
                                <Text as="p" variant="bodyMd" tone="subdued">
                                    View our data protection details and terms of service to understand how we handle your data.
                                </Text>
                                <Box>
                                    <RouterLink to="/legal" style={{ textDecoration: 'none' }}>
                                        <Link monochrome removeUnderline url="/legal">
                                            View Privacy Policy & Terms
                                        </Link>
                                    </RouterLink>
                                </Box>
                            </BlockStack>
                        </BlockStack>
                    </Card>
                </Layout.AnnotatedSection>
            </Layout>
        </Page>
    );
}
