import React from 'react';
import { Card, BlockStack, Text, Divider, Box, Tabs } from '@shopify/polaris';
import type { IForm } from '../../../api/forms';
import { FormSettings } from '../FormSettings';
import { SuccessPreview } from './SuccessPreview';

interface SettingsTabProps {
    formState: IForm;
    setFormState: React.Dispatch<React.SetStateAction<IForm | null>>;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
    formState,
    setFormState
}) => {
    const [selectedSubTab, setSelectedSubTab] = React.useState(0);

    const subTabs = [
        {
            id: 'settings-form-sub',
            content: 'Settings Form',
            accessibilityLabel: 'Edit form settings fields',
            panelID: 'settings-form-panel',
        },
        {
            id: 'settings-preview-sub',
            content: 'Preview Success Popup',
            accessibilityLabel: 'View the success popup preview',
            panelID: 'settings-preview-panel',
        },
    ];

    return (
        <Card padding="0">
            <Tabs tabs={subTabs} selected={selectedSubTab} onSelect={setSelectedSubTab}>
                <Box padding="400">
                    {selectedSubTab === 0 ? (
                        <div className="max-w-[800px] mx-auto">
                            <FormSettings formState={formState} setFormState={setFormState} />
                        </div>
                    ) : (
                        <BlockStack gap="400">
                            <div className="text-center mb-4">
                                <Text variant="headingMd" as="h2">Success State Preview</Text>
                                <Text variant="bodySm" tone="subdued" as="p">This is how your customers will see the final confirmation message.</Text>
                            </div>
                            <Divider />
                            <Box paddingBlockStart="600">
                                <SuccessPreview formState={formState} />
                            </Box>
                        </BlockStack>
                    ) }
                </Box>
            </Tabs>
        </Card>
    );
};
