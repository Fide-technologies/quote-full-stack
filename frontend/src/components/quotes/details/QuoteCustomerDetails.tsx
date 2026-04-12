import { BlockStack, InlineStack, Text, Box, Icon } from "@shopify/polaris";
import { PersonIcon, EmailIcon, PhoneIcon } from "@shopify/polaris-icons";
import { type QuoteCustomerDetailsProps } from "@/types/quote-details";

export function QuoteCustomerDetails({ firstName, lastName, email, phone }: QuoteCustomerDetailsProps) {
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Anonymous Customer';

    return (
        <BlockStack gap="400">
            <Text variant="headingSm" as="h3" fontWeight="semibold" tone="subdued">Contact Information</Text>
            <BlockStack gap="200">
                <InlineStack gap="300" blockAlign="center">
                    <Box width="20px">
                        <Icon source={PersonIcon} tone="subdued" />
                    </Box>
                    <Text variant="bodyMd" as="span" fontWeight="bold">{fullName}</Text>
                </InlineStack>
                <InlineStack gap="300" blockAlign="center">
                    <Box width="20px">
                        <Icon source={EmailIcon} tone="subdued" />
                    </Box>
                    <Text variant="bodyMd" as="span">{email || 'No email provided'}</Text>
                </InlineStack>
                <InlineStack gap="300" blockAlign="center">
                    <Box width="20px">
                        <Icon source={PhoneIcon} tone="subdued" />
                    </Box>
                    <Text variant="bodyMd" as="span">{phone || 'No phone provided'}</Text>
                </InlineStack>
            </BlockStack>
        </BlockStack>
    );
}
