import { Text, BlockStack } from "@shopify/polaris";
import { type QuoteMessageProps } from "@/types/quote-details";

export function QuoteMessage({ message }: QuoteMessageProps) {
    return (
        <BlockStack gap="200">
            <Text as="h2" variant="headingMd">Customer Message</Text>
            <Text as="p" tone="subdued">{message || 'No message provided.'}</Text>
        </BlockStack>
    );
}
