import { BlockStack, InlineStack, Text, Box, Icon } from "@shopify/polaris";
import { LocationIcon } from "@shopify/polaris-icons";
import { type QuoteAddressDetailsProps } from "@/types/quote-details";

export function QuoteAddressDetails({ address1, address2, city, state, pincode }: QuoteAddressDetailsProps) {
    const hasAddress = address1 || city || state || pincode;

    return (
        <BlockStack gap="300">
            <Text variant="headingSm" as="h3" fontWeight="semibold" tone="subdued">Shipping Address</Text>
            <InlineStack gap="300" align="start" blockAlign="start">
                <Box width="20px" paddingBlockStart="050">
                    <Icon source={LocationIcon} tone="subdued" />
                </Box>
                <BlockStack gap="100">
                    {hasAddress ? (
                        <>
                            {address1 && <Text variant="bodyMd" as="span" fontWeight="medium">{address1}</Text>}
                            {address2 && <Text variant="bodyMd" as="span" tone="subdued">{address2}</Text>}
                            {(city || state) && (
                                <Text variant="bodyMd" as="span" tone="subdued">
                                    {city}{city && state ? ', ' : ''}{state}
                                </Text>
                            )}
                            {pincode && (
                                <Text variant="bodyMd" as="span" tone="subdued">
                                    {pincode}
                                </Text>
                            )}
                        </>
                    ) : (
                        <Text variant="bodyMd" as="span" tone="subdued">
                            <span style={{ fontStyle: 'italic' }}>No shipping address provided</span>
                        </Text>
                    )}
                </BlockStack>
            </InlineStack>
        </BlockStack>
    );
}
