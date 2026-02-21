
import { Badge, BlockStack, InlineStack, LegacyCard, Text } from "@shopify/polaris";

import { type QuoteSystemInfoProps } from "@/types/quote-details";

export function QuoteSystemInfo({ status, createdAt }: QuoteSystemInfoProps) {
    return (
        <BlockStack gap="200">
            <Text as="h3" variant="headingMd">System Info</Text>
            <LegacyCard sectioned>
                <InlineStack gap="400">
                    <Badge>{status}</Badge>
                    <Text as="span" tone="subdued">Submitted: {new Date(createdAt).toLocaleString()}</Text>
                </InlineStack>
            </LegacyCard>
        </BlockStack>
    );
}
