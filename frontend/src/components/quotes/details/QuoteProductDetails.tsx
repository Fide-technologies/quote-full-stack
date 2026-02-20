
import { Box, BlockStack, InlineStack, Text, Thumbnail, LegacyCard } from "@shopify/polaris";
import { ImageIcon } from "@shopify/polaris-icons";

import { type QuoteProductDetailsProps } from "@/types/quote-details";

export function QuoteProductDetails({ productTitle, variantTitle, quantity, featuredImage }: QuoteProductDetailsProps) {
    return (
        <BlockStack gap="200">
            <Text as="h3" variant="headingMd">Product Information</Text>
            <LegacyCard sectioned>
                <InlineStack gap="400" align="start">
                    <Thumbnail
                        source={featuredImage?.url || ImageIcon}
                        alt={featuredImage?.altText || productTitle}
                        size="large"
                    />
                    <BlockStack gap="200">
                        <Text as="h3" variant="headingSm">{productTitle}</Text>
                        <InlineStack gap="400">
                            <Box><Text as="span" tone="subdued">Variant:</Text> <Text as="span">{variantTitle || '-'}</Text></Box>
                            <Box><Text as="span" tone="subdued">Quantity:</Text> <Text as="span">{quantity}</Text></Box>
                        </InlineStack>
                    </BlockStack>
                </InlineStack>
            </LegacyCard>
        </BlockStack>
    );
}
