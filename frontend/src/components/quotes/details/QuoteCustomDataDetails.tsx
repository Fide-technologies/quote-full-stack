import { Card, Text, BlockStack, InlineStack } from "@shopify/polaris";

interface QuoteCustomDataDetailsProps {
    customData?: Record<string, any>;
}

export function QuoteCustomDataDetails({ customData }: QuoteCustomDataDetailsProps) {
    if (!customData || Object.keys(customData).length === 0) return null;

    return (
        <Card>
            <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Custom Form Fields</Text>
                <BlockStack gap="200">
                    {Object.entries(customData).map(([key, value]) => (
                        <InlineStack key={key} align="space-between">
                            <Text variant="bodyMd" as="span" fontWeight="medium">{key}:</Text>
                            <Text variant="bodyMd" as="span">{value !== null && value !== undefined ? String(value) : '-'}</Text>
                        </InlineStack>
                    ))}
                </BlockStack>
            </BlockStack>
        </Card>
    );
}
