
import { Box, Button, BlockStack, Text, Card } from "@shopify/polaris";

import type { QuoteDraftOrderInfoProps } from "@/types/quote-details";

export function QuoteDraftOrderInfo({ draftOrderId, draftOrderUrl }: QuoteDraftOrderInfoProps) {
    if (!draftOrderUrl) return null;

    return (
        <BlockStack gap="200">
            <Text as="h3" variant="headingMd">Draft Order Information</Text>
            <Card>
                <BlockStack gap="200">
                    <Box><Text as="span" tone="subdued">Draft Order ID:</Text> <Text as="span" fontWeight="bold">{draftOrderId}</Text></Box>
                    <Button
                        url={draftOrderUrl}
                        external
                        variant="primary"
                    >
                        View in Shopify Checkout
                    </Button>
                </BlockStack>
            </Card>
        </BlockStack>
    );
}
