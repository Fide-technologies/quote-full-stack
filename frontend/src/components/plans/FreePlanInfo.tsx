import React from 'react';
import { Card, BlockStack, Text, Button, Box } from '@shopify/polaris';

export const FreePlanInfo: React.FC = () => {
    return (
        <Card padding="800">
            <BlockStack gap="400" align="center" inlineAlign="center">
                <Box paddingBlockEnd="400">
                    <Text as="h2" variant="heading2xl" alignment="center">
                        Merchant Quote is completely FREE 🎉
                    </Text>
                </Box>
                <Text as="p" variant="bodyLg" alignment="center" tone="subdued">
                    We're thrilled to offer you full access to the Merchant Quote platform without any subscriptions or credit card requirements. Enjoy all features with a massive quota of 10,000 completely free quotes every single month!
                </Text>
                <Box paddingBlockStart="400">
                    <Button size="large" variant="primary" url="/">Go to Dashboard</Button>
                </Box>
            </BlockStack>
        </Card>
    );
};
