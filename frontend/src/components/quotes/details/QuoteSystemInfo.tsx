import { BlockStack, InlineStack, Text } from "@shopify/polaris";
import { type QuoteSystemInfoProps } from "@/types/quote-details";

export function QuoteSystemInfo({ createdAt }: QuoteSystemInfoProps) {
    return (
        <BlockStack gap="100">
            <InlineStack gap="400">
                <Text as="span" tone="subdued">Submitted on: <Text as="span" fontWeight="medium" variant="bodyMd">{new Date(createdAt).toLocaleString()}</Text></Text>
            </InlineStack>
        </BlockStack>
    );
}
