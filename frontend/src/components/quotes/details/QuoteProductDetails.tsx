import { BlockStack, InlineStack, Text, Thumbnail, Box } from "@shopify/polaris";
import { ImageIcon } from "@shopify/polaris-icons";

import { type QuoteProductDetailsProps } from "@/types/quote-details";

export function QuoteProductDetails({ productTitle, variantTitle, quantity, featuredImage }: QuoteProductDetailsProps) {
    return (
        <BlockStack gap="400">
            <Text as="h2" variant="headingMd" fontWeight="semibold">Requested Items</Text>
            <Box padding="400" background="bg-surface" borderRadius="300" borderWidth="025" borderColor="border">
                <InlineStack gap="400" align="start" blockAlign="center">
                    <Thumbnail
                        source={featuredImage?.url || ImageIcon}
                        alt={featuredImage?.altText || productTitle}
                        size="large"
                    />
                    <BlockStack gap="100">
                        <Text as="h3" variant="headingSm" fontWeight="bold">{productTitle}</Text>
                        <InlineStack gap="400">
                            <Text as="span" tone="subdued">
                                Variant: <Text as="span" variant="bodyMd" fontWeight="medium" tone="base">{variantTitle || 'Default'}</Text>
                            </Text>
                            <Text as="span" tone="subdued">
                                Quantity: <Text as="span" variant="bodyMd" fontWeight="medium" tone="base">x{quantity}</Text>
                            </Text>
                        </InlineStack>
                    </BlockStack>
                </InlineStack>
            </Box>
        </BlockStack>
    );
}
