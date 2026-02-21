
import { Text, BlockStack, LegacyCard } from "@shopify/polaris";

import { type QuoteMessageProps } from "@/types/quote-details";

export function QuoteMessage({ message }: QuoteMessageProps) {
    return (
        <BlockStack gap="200">
            <Text as="h3" variant="headingMd">Message</Text>
            <LegacyCard sectioned>
                <Text as="p">{message || 'No message provided.'}</Text>
            </LegacyCard>
        </BlockStack>
    );
}
