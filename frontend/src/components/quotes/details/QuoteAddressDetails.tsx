import { Text, BlockStack, Icon, InlineStack } from "@shopify/polaris";
import { LocationIcon } from "@shopify/polaris-icons";
import { type QuoteAddressDetailsProps } from "@/types/quote-details";

export function QuoteAddressDetails({ address1, address2, city, district, state, pincode }: QuoteAddressDetailsProps) {
    return (
        <BlockStack gap="400">
            <InlineStack gap="100" blockAlign="center">
                <Icon source={LocationIcon} tone="subdued" />
                <Text as="h3" variant="headingSm" fontWeight="medium">Shipping Address</Text>
            </InlineStack>
            <BlockStack gap="100">
                <Text as="p">{address1}</Text>
                {address2 && <Text as="p">{address2}</Text>}
                <Text as="p">
                    {city && `${city}, `}
                    {district}
                </Text>
                <Text as="p">
                    {state}
                    {pincode && ` - ${pincode}`}
            </Text>
        </BlockStack>
    </BlockStack>
);
}
