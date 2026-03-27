
import { Button, InlineStack, Text, BlockStack } from "@shopify/polaris";
import { ChatIcon } from "@shopify/polaris-icons";

import { type QuoteCustomerDetailsProps } from "@/types/quote-details";

export function QuoteCustomerDetails({ firstName, lastName, email, phone, whatsappUrl }: QuoteCustomerDetailsProps) {
    return (
        <BlockStack gap="400">
            <InlineStack align="space-between" blockAlign="center">
                <Text as="h3" variant="headingSm" fontWeight="medium">Contact Information</Text>
                <Button
                    icon={ChatIcon}
                    onClick={() => window.open(whatsappUrl, '_blank')}
                    variant="plain"
                >
                    Chat on WhatsApp
                </Button>
            </InlineStack>
            <BlockStack gap="100">
                <InlineStack gap="200">
                    <Text as="span" tone="subdued">Name:</Text>
                    <Text as="span" fontWeight="bold">{firstName} {lastName}</Text>
                </InlineStack>
                <InlineStack gap="200">
                    <Text as="span" tone="subdued">Email:</Text>
                    <Text as="span">{email}</Text>
                </InlineStack>
                {phone && (
                   <InlineStack gap="200">
                        <Text as="span" tone="subdued">Phone:</Text>
                        <Text as="span">{phone}</Text>
                    </InlineStack>
                )}
            </BlockStack>
        </BlockStack>
    );
}


