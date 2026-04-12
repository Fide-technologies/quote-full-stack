import React from 'react';
import { Box, BlockStack, Text } from '@shopify/polaris';

import type { AnalyticsCardProps } from '../../types/dashboard';

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ title, value, subtitle, tone = 'subdued' }) => {
    return (
        <Box padding="400" background="bg-surface-secondary" borderRadius="300">
            <BlockStack gap="200">
                <Text variant="bodySm" as="p" tone="subdued" fontWeight="medium">{title}</Text>
                <BlockStack gap="100">
                    <Text variant="headingLg" as="p">{value}</Text>
                    <Text variant="bodySm" as="p" tone={tone}>{subtitle}</Text>
                </BlockStack>
            </BlockStack>
        </Box>
    );
};
