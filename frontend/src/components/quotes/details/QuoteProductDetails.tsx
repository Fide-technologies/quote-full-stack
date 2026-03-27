import { BlockStack, InlineStack, Text, Thumbnail } from "@shopify/polaris";
import { ImageIcon } from "@shopify/polaris-icons";

import { type QuoteProductDetailsProps } from "@/types/quote-details";

export function QuoteProductDetails({ productTitle, variantTitle, quantity, featuredImage }: QuoteProductDetailsProps) {
    return (
        <BlockStack gap="200">
            <Text as="h2" variant="headingMd">Product Information</Text>
            <InlineStack gap="400" align="start">
                <Thumbnail
                    source={featuredImage?.url || ImageIcon}
                    alt={featuredImage?.altText || productTitle}
                    size="large"
                />
                <BlockStack gap="100">
                    <Text as="h3" variant="headingSm" fontWeight="medium">{productTitle}</Text>
                    <InlineStack gap="400">
                        <Text as="span" tone="subdued">Variant: <Text as="span" variant="bodyMd" fontWeight="semibold">{variantTitle || '-'}</Text></Text>
                        <Text as="span" tone="subdued">Quantity: <Text as="span" variant="bodyMd" fontWeight="semibold">{quantity}</Text></Text>
                    </InlineStack>
                </BlockStack>
            </InlineStack>
        </BlockStack>
    );
}
