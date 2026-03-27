import { Text, BlockStack } from "@shopify/polaris";
import { type QuoteAddressDetailsProps } from "@/types/quote-details";

export function QuoteAddressDetails({ address1, address2, city, district, state, pincode }: QuoteAddressDetailsProps) {
    return (
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
    );
}
