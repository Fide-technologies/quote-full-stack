import React from 'react';
import { BlockStack, Text, Box, Grid } from '@shopify/polaris';
import type { IForm } from '@/api/forms';
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
    return (
        <Box padding="500">
            <Grid>
                <Grid.Cell columnSpan={{ xs: 6, lg: 7 }}>
                    <FormSettings formState={formState} setFormState={setFormState} />
                </Grid.Cell>
                <Grid.Cell columnSpan={{ xs: 6, lg: 5 }}>
                    <div style={{ position: 'sticky', top: 'var(--p-space-400)', alignSelf: 'start' }}>
                        <BlockStack gap="400">
                            <Box padding="400" background="bg-surface-secondary" borderRadius="200" borderWidth="025" borderColor="border">
                                <BlockStack gap="400">
                                    <div className="text-center">
                                        <Text variant="headingMd" as="h2">Success State Preview</Text>
                                        <Text variant="bodySm" tone="subdued" as="p">This is how your customers will see the final confirmation message.</Text>
                                    </div>
                                    <SuccessPreview formState={formState} />
                                </BlockStack>
                            </Box>
                        </BlockStack>
                    </div>
                </Grid.Cell>
            </Grid>
        </Box>
    );
};
