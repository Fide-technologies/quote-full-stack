import React from 'react';
import {
    Page,
    Box,
    Banner,
    Tabs,
} from '@shopify/polaris';
import { PlusIcon, SaveIcon } from '@shopify/polaris-icons';
import { useFormBuilder } from '../hooks/useFormBuilder';
import { PageLoader } from '../components/loaders/PageLoader';
import { BuilderTab } from '../components/FormBuilder/tabs/BuilderTab';
import { SettingsTab } from '../components/FormBuilder/tabs/SettingsTab';
import { PreviewTab } from '../components/FormBuilder/tabs/PreviewTab';

export const FormBuilder: React.FC = () => {
    const {
        formState,
        setFormState,
        isLoading,
        isSaving,
        expandedStep,
        setExpandedStep,
        previewStepIndex,
        setPreviewStepIndex,
        selectedTab,
        setSelectedTab,
        canEdit,
        handleDragEnd,
        addStep,
        addField,
        handleSave,
        stepsCount
    } = useFormBuilder();

    if (isLoading) {
        return <PageLoader title="Form Builder" primaryAction hasSidebar />;
    }

    if (!canEdit) {
        return (
            <Page title="Form Builder">
                <Box paddingBlockEnd="800">
                    <Banner tone="warning" title="Upgrade required">
                        <p>The form builder is only available on professional plans. Please upgrade to customize your quote form.</p>
                    </Banner>
                </Box>
            </Page>
        );
    }

    const tabs = [
        {
            id: 'builder-tab',
            content: 'Builder',
            accessibilityLabel: 'Edit form fields',
            panelID: 'builder-panel',
        },
        {
            id: 'preview-tab',
            content: 'Preview',
            accessibilityLabel: 'View full form preview',
            panelID: 'preview-panel',
        },
        {
            id: 'settings-tab',
            content: 'Settings',
            accessibilityLabel: 'Edit form settings',
            panelID: 'settings-panel',
        },
    ];

    return (
        <Page
            title="Form Builder"
            primaryAction={selectedTab === 1 ? undefined : {
                content: selectedTab === 0 ? 'Save Form' : 'Save Settings',
                icon: SaveIcon,
                onAction: handleSave,
                loading: isSaving,
                disabled: isSaving
            }}
            secondaryActions={selectedTab === 0 ? [
                {
                    content: 'Add Step',
                    icon: PlusIcon,
                    onAction: addStep,
                    disabled: stepsCount >= 6
                }
            ] : []}
        >
            <Box paddingBlockEnd="800">
                <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
                    <Box paddingBlockStart="400">
                        {formState && (
                            <>
                                {selectedTab === 0 && (
                                    <BuilderTab 
                                        formState={formState}
                                        setFormState={setFormState}
                                        expandedStep={expandedStep}
                                        setExpandedStep={setExpandedStep}
                                        addField={addField}
                                        handleDragEnd={handleDragEnd}
                                    />
                                )}
                                {selectedTab === 1 && (
                                    <PreviewTab 
                                        formState={formState}
                                        previewStepIndex={previewStepIndex}
                                        setPreviewStepIndex={setPreviewStepIndex}
                                        stepsCount={stepsCount}
                                    />
                                )}
                                {selectedTab === 2 && (
                                    <SettingsTab 
                                        formState={formState}
                                        setFormState={setFormState}
                                    />
                                )}
                            </>
                        )}
                    </Box>
                </Tabs>
            </Box>
        </Page>
    );
};
