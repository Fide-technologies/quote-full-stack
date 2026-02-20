import { Page, Layout, BlockStack, Text, Box, Card, Banner, SkeletonPage, SkeletonBodyText, InlineStack, Badge } from "@shopify/polaris";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings, updateSettings } from "../api/settings"
import { GlobalSettingsCard } from "../components/settings/GlobalSettingsCard";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect } from "react";


export const Settings: React.FC = () => {
    const queryClient = useQueryClient();
    const shopify = useAppBridge();

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["settings"],
        queryFn: getSettings,
    });

    const mutation = useMutation({
        mutationFn: updateSettings,
        onSuccess: (_data, variables) => {
            queryClient.setQueryData(["settings"], (old: any) => ({
                ...old,
                showOnAll: variables,
            }));

            queryClient.invalidateQueries({ queryKey: ["settings"] });
            shopify.toast.show("Settings saved successfully");
        },
        onError: () => {
            shopify.toast.show("Failed to save settings", { isError: true });
        }
    });

    useEffect(() => {
        shopify.loading(isLoading || mutation.isPending);
    }, [isLoading, mutation.isPending, shopify]);

    if (isLoading) {
        return (
            <SkeletonPage title="Quote App Settings">
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
            compactTitle
        >
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
                                showOnAll={data?.showOnAll ?? true}
                                onShowOnAllChange={(value: boolean) =>
                                    mutation.mutate(value)
                                }
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
                                            Prices will be hidden for all products when the quote button is shown.
                                        </Text>
                                    </BlockStack>
                                    <Badge tone="info">Always Active</Badge>
                                </InlineStack>
                            </Box>
                        </BlockStack>
                    </Card>
                </Layout.AnnotatedSection>

            </Layout>
        </Page>
    );
}
