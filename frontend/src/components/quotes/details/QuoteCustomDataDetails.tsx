import React from 'react';
import { Text, BlockStack, InlineStack, Box, Divider } from "@shopify/polaris";

interface QuoteCustomDataDetailsProps {
    customData?: Record<string, unknown>;
}

export function QuoteCustomDataDetails({ customData }: QuoteCustomDataDetailsProps) {
    if (!customData || Object.keys(customData).length === 0) return null;

    const entries = Object.entries(customData);

    return (
        <BlockStack gap="300">
            <Text variant="headingSm" as="h3" fontWeight="semibold" tone="subdued">Custom Form Entries</Text>
            <Box background="bg-surface-secondary" padding="400" borderRadius="200">
                <BlockStack gap="200">
                    {entries.map(([key, value], index) => (
                        <React.Fragment key={key}>
                            <InlineStack align="space-between" blockAlign="center">
                                <Text variant="bodyMd" as="span" fontWeight="medium" tone="subdued">{key}</Text>
                                <Text variant="bodyMd" as="span" fontWeight="semibold">{value !== null && value !== undefined ? String(value) : '-'}</Text>
                            </InlineStack>
                            {index < entries.length - 1 && <Divider />}
                        </React.Fragment>
                    ))}
                </BlockStack>
            </Box>
        </BlockStack>
    );
}

