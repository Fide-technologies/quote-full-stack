import { BlockStack, Text, Box, InlineStack, Icon } from "@shopify/polaris";
import { NoteIcon } from "@shopify/polaris-icons";
import { type QuoteMessageProps } from "@/types/quote-details";

export function QuoteMessage({ message }: QuoteMessageProps) {
    if (!message) return null;

    return (
        <BlockStack gap="300">
            <InlineStack gap="200" blockAlign="center">
                <Text as="h2" variant="headingMd" fontWeight="semibold">Customer Note</Text>
            </InlineStack>
            <Box 
                padding="400" 
                background="bg-surface-info" 
                borderRadius="200"
                borderWidth="025"
                borderColor="border-info"
            >
                <InlineStack gap="300" align="start" blockAlign="start">
                    <Box paddingBlockStart="050">
                        <Icon source={NoteIcon} tone="info" />
                    </Box>
                    <div style={{ flex: 1 }}>
                        <Text as="p" variant="bodyMd" tone="base">
                            <span style={{ fontStyle: 'italic' }}>"{message}"</span>
                        </Text>
                    </div>
                </InlineStack>
            </Box>
        </BlockStack>
    );
}
