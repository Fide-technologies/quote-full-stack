import React from 'react';
import { Card, BlockStack, InlineStack, Text, Badge, Divider, Box } from '@shopify/polaris';
import type { IForm } from '../../../api/forms';
import { FormPreview } from '../FormPreview';

interface PreviewTabProps {
    formState: IForm;
    previewStepIndex: number;
    setPreviewStepIndex: (index: number) => void;
    stepsCount: number;
}

export const PreviewTab: React.FC<PreviewTabProps> = ({
    formState,
    previewStepIndex,
    setPreviewStepIndex,
    stepsCount
}) => {
    return (
        <BlockStack gap="400">
            <Card>
                <BlockStack gap="300">
                    <InlineStack align="space-between" blockAlign="center">
                        <Text variant="headingMd" as="h2">Full Page Preview</Text>
                        <Badge tone="info">{`${stepsCount} Steps`}</Badge>
                    </InlineStack>
                    <Divider />
                    <Box paddingBlockStart="200">
                        <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                            <FormPreview
                                formState={formState}
                                previewStepIndex={previewStepIndex}
                                setPreviewStepIndex={setPreviewStepIndex}
                            />
                        </div>
                    </Box>
                </BlockStack>
            </Card>
        </BlockStack>
    );
};
