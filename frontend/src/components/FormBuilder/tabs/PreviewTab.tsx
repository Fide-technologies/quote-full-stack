import { BlockStack, Box, Card, Divider, InlineStack, Text } from '@shopify/polaris';
import type React from 'react';
import type { IForm } from '../../../api/forms';
import { FormPreview } from '../FormPreview';

interface PreviewTabProps {
  formState: IForm;
}

export const PreviewTab: React.FC<PreviewTabProps> = ({ formState }) => {
  return (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="300">
          <InlineStack align="space-between" blockAlign="center">
            <Text variant="headingMd" as="h2">
              Form Preview
            </Text>
          </InlineStack>
          <Divider />
          <Box paddingBlockStart="200">
            <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
              <FormPreview formState={formState} />
            </div>
          </Box>
        </BlockStack>
      </Card>
    </BlockStack>
  );
};
