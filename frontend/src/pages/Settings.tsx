import {
    Page,
    Layout,
    Tabs,
    Box,
    SkeletonPage,
    Card,
    BlockStack,
    SkeletonBodyText,
    Banner,
    Text,
    Checkbox,
    Grid
} from "@shopify/polaris";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings, updateSettings } from "../api/settings";
import { useAppBridge, SaveBar } from "@shopify/app-bridge-react";
import { useState, useCallback, useMemo, useEffect } from "react";
import type { ISettings } from "../types/settings";
import { DEFAULT_SETTINGS } from "../types/settings";

import { QuoteButtonSettings } from "../components/settings/QuoteButtonSettings";
import { PricingSettings } from "../components/settings/PricingSettings";
import { PreviewCard } from "../components/settings/PreviewCard";

export const Settings: React.FC = () => {
    const queryClient = useQueryClient();
    const shopify = useAppBridge();
    const [selectedTab, setSelectedTab] = useState(0);
    const [localSettings, setLocalSettings] = useState<ISettings | null>(null);
    const [hasChanged, setHasChanged] = useState(false);

    const { data: serverSettings, isLoading, isError, error } = useQuery<ISettings>({
        queryKey: ["settings"],
        queryFn: getSettings,
    });

    const normalizedServerSettings = useMemo((): ISettings => {
        return { ...DEFAULT_SETTINGS, ...serverSettings };
    }, [serverSettings]);

    const currentSettings = useMemo((): ISettings => {
        return {
            ...normalizedServerSettings,
            ...localSettings
        };
    }, [localSettings, normalizedServerSettings]);

    const mutation = useMutation({
        mutationFn: (settings: ISettings) => updateSettings(settings),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings"] });
            shopify.toast.show("Settings saved successfully");
            setLocalSettings(null);
            setHasChanged(false);
        },
        onError: () => {
            shopify.toast.show("Failed to save settings", { isError: true });
        }
    });

    useEffect(() => {
        if (hasChanged) {
            shopify.saveBar.show("settings-save-bar");
        } else {
            shopify.saveBar.hide("settings-save-bar");
        }
    }, [hasChanged, shopify]);

    const handleFieldChange = useCallback((key: keyof ISettings, value: any) => {
        setLocalSettings((prev: ISettings | null) => ({
            ...(prev || normalizedServerSettings),
            [key]: value
        }));
        setHasChanged(true);
    }, [normalizedServerSettings]);

    const handleSave = useCallback(() => {
        if (localSettings) {
            const { plan, isAppEmbedded, deepLinkUrl, ...settingsToSave } = currentSettings;
            mutation.mutate(settingsToSave as ISettings);
        }
    }, [localSettings, currentSettings, mutation]);

    const handleDiscard = useCallback(() => {
        setLocalSettings(null);
        setHasChanged(false);
    }, []);

    const tabs = [
        { id: 'button', content: 'Quote button', accessibilityLabel: 'Quote button', panelID: 'button-panel' },
        { id: 'pricing', content: 'Hide price', accessibilityLabel: 'Hide price', panelID: 'pricing-panel' },
        { id: 'hide-buttons', content: 'Hide checkout buttons', accessibilityLabel: 'Hide checkout buttons', panelID: 'hide-buttons-panel' },
        { id: 'cart-widget', content: 'Quote cart widget', accessibilityLabel: 'Quote cart widget', panelID: 'cart-widget-panel' },
        { id: 'history-widget', content: 'Quote history widget', accessibilityLabel: 'Quote history widget', panelID: 'history-widget-panel' },
    ];

    const showPreview = selectedTab < 3;

    const renderTabContent = () => {
        switch (tabs[selectedTab].id) {
            case 'button': return <QuoteButtonSettings settings={currentSettings} onChange={handleFieldChange} />;
            case 'pricing': return <PricingSettings settings={currentSettings} onChange={handleFieldChange} />;
            case 'hide-buttons':
                return (
                    <BlockStack gap="400">
                        <Text as="h2" variant="headingMd">Storefront Button Visibility</Text>
                        <Checkbox
                            label="Hide 'Add to cart' button when quote is enabled"
                            checked={currentSettings.hideAddToCart}
                            onChange={(v) => handleFieldChange('hideAddToCart', v)}
                        />
                        <Checkbox
                            label="Hide 'Buy It Now' button when quote is enabled"
                            checked={currentSettings.hideBuyNow}
                            onChange={(v) => handleFieldChange('hideBuyNow', v)}
                            helpText="Disable dynamic checkout buttons like PayPal or Apple Pay."
                        />
                    </BlockStack>
                );
            case 'cart-widget': return <Text as="p">Quote cart widget settings coming soon.</Text>;
            case 'history-widget': return <Text as="p">Quote history widget settings coming soon.</Text>;
            default: return null;
        }
    };

    if (isLoading) {
        return (
            <SkeletonPage title="Settings">
                <Layout>
                    <Layout.Section>
                        <Card><SkeletonBodyText lines={5} /></Card>
                    </Layout.Section>
                </Layout>
            </SkeletonPage>
        );
    }

    const showEmbedBanner = currentSettings.isAppEmbedded === false;

    return (
        <Page
            title="O:Request a Quote"
            subtitle="Manage your quote request configuration and appearance."
        >
            <SaveBar id="settings-save-bar">
                <button variant="primary" onClick={handleSave} disabled={mutation.isPending}>Save</button>
                <button onClick={handleDiscard} disabled={mutation.isPending}>Discard</button>
            </SaveBar>

            <Layout>
                {isError && (
                    <Layout.Section>
                        <Banner tone="critical" title="Error loading settings">
                            <p>{(error as Error)?.message || "Something went wrong while fetching your settings."}</p>
                        </Banner>
                    </Layout.Section>
                )}

                {showEmbedBanner && (
                    <Layout.Section>
                        <Banner
                            tone="warning"
                            title="Action required"
                            action={{
                                content: "Activate now",
                                url: currentSettings.deepLinkUrl,
                                external: true
                            }}
                        >
                            <p>In order for <b>Merchant Quote</b> to work on your storefront, go to your online store editor and activate the <b>Merchant Quote</b> app embed.</p>
                        </Banner>
                    </Layout.Section>
                )}

                <Layout.Section>
                    <Card padding="0">
                        <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
                            <Box padding="500">
                                {showPreview ? (
                                    <Grid>
                                        <Grid.Cell columnSpan={{ xs: 6, lg: 7 }}>
                                            <BlockStack gap="400">
                                                <Text variant="headingMd" as="h2">Logic</Text>
                                                {renderTabContent()}
                                            </BlockStack>
                                        </Grid.Cell>
                                        <Grid.Cell columnSpan={{ xs: 6, lg: 5 }}>
                                            <div style={{ position: 'sticky', top: 'var(--p-space-400)', alignSelf: 'start' }}>
                                                <PreviewCard settings={currentSettings} />
                                            </div>
                                        </Grid.Cell>
                                    </Grid>
                                ) : (
                                    renderTabContent()
                                )}
                            </Box>
                        </Tabs>
                    </Card>
                </Layout.Section>

            </Layout>
        </Page>
    );
};
