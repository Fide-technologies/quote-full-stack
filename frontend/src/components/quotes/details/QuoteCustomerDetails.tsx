
import { Box, Button, InlineStack, LegacyCard, Text, BlockStack } from "@shopify/polaris";
import { ChatIcon } from "@shopify/polaris-icons";

import { type QuoteCustomerDetailsProps } from "@/types/quote-details";

export function QuoteCustomerDetails({ firstName, lastName, email, phone, whatsappUrl }: QuoteCustomerDetailsProps) {
    return (
        <BlockStack gap="200">
            <InlineStack align="space-between" blockAlign="center">
                <Text as="h3" variant="headingMd">Customer Details</Text>
                <Button
                    icon={ChatIcon}
                    onClick={() => window.open(whatsappUrl, '_blank')}
                    variant="plain"
                >
                    Chat on WhatsApp
                </Button>
            </InlineStack>
            <LegacyCard sectioned>
                <InlineStack gap="600" wrap={false}>
                    <Box minWidth="150px"><Text as="span" tone="subdued">Name:</Text> <Text as="span" fontWeight="bold">{firstName} {lastName}</Text></Box>
                    <Box minWidth="150px"><Text as="span" tone="subdued">Email:</Text> <Text as="span">{email}</Text></Box>
                    <Box minWidth="150px"><Text as="span" tone="subdued">Phone:</Text> <Text as="span">{phone}</Text></Box>
                </InlineStack>
            </LegacyCard>
        </BlockStack>
    );
}
