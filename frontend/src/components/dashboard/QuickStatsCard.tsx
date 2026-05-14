import { BlockStack, Box, Card, Icon, InlineStack, Text } from '@shopify/polaris';
import { CheckIcon, PersonIcon } from '@shopify/polaris-icons';
import type React from 'react';

import type { QuickStatsCardProps } from '../../types/dashboard';

export const QuickStatsCard: React.FC<QuickStatsCardProps> = ({ totalQuotes, convertedQuotes }) => {
  return (
    <Card>
      <BlockStack gap="300">
        <Text variant="headingMd" as="h3">
          Quick Analytics
        </Text>
        <BlockStack gap="200">
          <InlineStack gap="200" blockAlign="center">
            <Box width="20px">
              <Icon source={PersonIcon} tone="subdued" />
            </Box>
            <Text as="span">Total Customer Requests: {totalQuotes}</Text>
          </InlineStack>
          <InlineStack gap="200" blockAlign="center">
            <Box width="20px">
              <Icon source={CheckIcon} tone="subdued" />
            </Box>
            <Text as="span">Converted to Orders: {convertedQuotes}</Text>
          </InlineStack>
        </BlockStack>
      </BlockStack>
    </Card>
  );
};
