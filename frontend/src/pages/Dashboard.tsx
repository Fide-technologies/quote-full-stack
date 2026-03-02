import React from 'react';
import { Page, Layout, Card, BlockStack, Text, Box, Button } from '@shopify/polaris';

export const Dashboard: React.FC = () => {
    return (
        <Page title="Dashboard">
            <Layout>
                <Layout.Section>
                    <Card>
                        <BlockStack gap="400">
                            <Text as="h2" variant="headingMd">
                                Welcome to your B2B App
                            </Text>
                            <Text as="p" variant="bodyMd">
                                This is the main dashboard. Here you can show high-level metrics, quick actions, and recent activity.
                            </Text>
                        </BlockStack>
                    </Card>
                </Layout.Section>
                <Layout.Section variant="oneThird">
                    <Card>
                        <BlockStack gap="400">
                            <Text as="h2" variant="headingMd">
                                Quick Action
                            </Text>
                            <Box>
                                <Button onClick={() => console.log('Action')}>Perform Action</Button>
                            </Box>
                        </BlockStack>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    );
};
