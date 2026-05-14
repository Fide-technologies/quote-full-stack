import {
    BlockStack,
    Box,
    Card,
    Grid,
    Layout,
    Page,
    Tabs,
    Text,
} from "@shopify/polaris";
import { SaveBar } from "@shopify/app-bridge-react";
import React from "react";
import { PreviewCard } from "../components/settings/PreviewCard";
import { PageLoader } from "../components/loaders/PageLoader";
import { ErrorState } from "../components/common/ErrorState";
import { useSettingsLogic } from "../hooks/useSettingsLogic";
import { SettingsTabs } from "../components/settings/SettingsTabs";

export const Settings: React.FC = () => {
    const {
        selectedTab,
        setSelectedTab,
        currentSettings,
        handleFieldChange,
        handleSave,
        handleDiscard,
        isLoading,
        isError,
        error,
        refetch,
        isSaving,
        tabs,
    } = useSettingsLogic();

    if (isLoading) return <PageLoader title="Settings" />;
    
    if (isError) {
        return (
            <ErrorState
                title="Settings"
                message={(error as Error)?.message || "Something went wrong while fetching your settings."}
                onRetry={() => refetch()}
            />
        );
    }

    const showPreview = selectedTab < 3;
    const activeTabId = tabs[selectedTab].id;

    return (
        <Page title="Request a Quote" subtitle="Manage your quote request configuration and appearance.">
            <SaveBar id="settings-save-bar">
                <button variant="primary" onClick={handleSave} disabled={isSaving}>
                    Save
                </button>
                <button onClick={handleDiscard} disabled={isSaving}>
                    Discard
                </button>
            </SaveBar>

            <Layout>
                <Layout.Section>
                    <Card padding="0">
                        <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
                            <Box padding="500">
                                {showPreview ? (
                                    <Grid>
                                        <Grid.Cell columnSpan={{ xs: 6, lg: 7 }}>
                                            <BlockStack gap="400">
                                                <Text variant="headingMd" as="h2">Logic</Text>
                                                <SettingsTabs 
                                                    tabId={activeTabId} 
                                                    settings={currentSettings} 
                                                    onChange={handleFieldChange} 
                                                />
                                            </BlockStack>
                                        </Grid.Cell>
                                        <Grid.Cell columnSpan={{ xs: 6, lg: 5 }}>
                                            <div style={{ position: "sticky", top: "var(--p-space-400)", alignSelf: "start" }}>
                                                <PreviewCard settings={currentSettings} />
                                            </div>
                                        </Grid.Cell>
                                    </Grid>
                                ) : (
                                    <SettingsTabs 
                                        tabId={activeTabId} 
                                        settings={currentSettings} 
                                        onChange={handleFieldChange} 
                                    />
                                )}
                            </Box>
                        </Tabs>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    );
};
