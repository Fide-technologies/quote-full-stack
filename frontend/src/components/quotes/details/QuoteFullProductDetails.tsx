import React from 'react';
import {
    BlockStack,
    Text,
    InlineStack,
    ResourceList,
    ResourceItem,
    Box,
    Badge,
} from "@shopify/polaris";
import { type Quote } from "@/api/quotes";
import { formatCurrency } from '@/utils/currency';

interface QuoteFullProductDetailsProps {
    productDetails: Quote['productDetails'];
}

export const QuoteFullProductDetails: React.FC<QuoteFullProductDetailsProps> = ({ productDetails }) => {
    if (!productDetails) return null;

    const { vendor, productType, variants } = productDetails;
    const variantList = variants?.nodes || [];

    return (
        <BlockStack gap="400">
            <Text as="h2" variant="headingMd" fontWeight="semibold">Inventory Insight</Text>
            
            <Box background="bg-surface-secondary" padding="400" borderRadius="200">
                <BlockStack gap="300">
                    <InlineStack align="space-between">
                        <Text as="span" tone="subdued" fontWeight="medium">Vendor</Text>
                        <Badge tone="info">{vendor || 'Not specified'}</Badge>
                    </InlineStack>
                    <InlineStack align="space-between">
                        <Text as="span" tone="subdued" fontWeight="medium">Product Type</Text>
                        <Text as="span" variant="bodyMd" fontWeight="semibold">{productType || 'Standard'}</Text>
                    </InlineStack>
                </BlockStack>
            </Box>

            {variantList.length > 0 && (
                <BlockStack gap="200">
                    <Text as="h3" variant="headingSm" fontWeight="semibold">Stock Availability</Text>
                    <Box borderWidth="025" borderColor="border" borderRadius="200" overflowX="hidden">
                        <ResourceList
                            resourceName={{ singular: 'variant', plural: 'variants' }}
                            items={variantList}
                            renderItem={(item) => {
                                return (
                                    <ResourceItem
                                        id={item.id}
                                        onClick={() => {}}
                                    >
                                        <InlineStack align="space-between" blockAlign="center">
                                            <BlockStack gap="100">
                                                <Text as="h3" variant="bodyMd" fontWeight="bold">
                                                    {item.title}
                                                </Text>
                                                <Text as="p" variant="bodySm" tone="subdued">
                                                    SKU: {item.sku || 'N/A'}
                                                </Text>
                                            </BlockStack>
                                            <BlockStack align="end" gap="100">
                                                <Text as="p" variant="bodyMd" fontWeight="bold" tone="success">
                                                    {formatCurrency(Number(item.price), 'USD')}
                                                </Text>
                                                <Badge tone={item.inventoryQuantity > 0 ? "success" : "warning"}>
                                                    {item.inventoryQuantity ? `${item.inventoryQuantity} in stock` : 'Out of stock'}
                                                </Badge>
                                            </BlockStack>
                                        </InlineStack>
                                    </ResourceItem>
                                );
                            }}
                        />
                    </Box>
                </BlockStack>
            )}
        </BlockStack>
    );
};
