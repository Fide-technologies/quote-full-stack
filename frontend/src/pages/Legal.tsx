import React from 'react';
import { Page, Layout, Card, BlockStack, Text, List, Divider, Box } from "@shopify/polaris";

export const Legal: React.FC = () => {
    return (
        <Page
            title="Legal & Privacy"
            subtitle="Understand how we handle your data and your customers' privacy."
        >
            <Layout>
                <Layout.Section>
                    <Card>
                        <BlockStack gap="500">
                            <BlockStack gap="200">
                                <Text variant="headingLg" as="h2">Privacy Policy</Text>
                                <Text variant="bodyMd" as="p">
                                    This Privacy Policy describes how your personal information is collected, used, and shared when you install or use the <strong>merchant-quote</strong> App (the "App") in connection with your Shopify-supported store.
                                </Text>
                            </BlockStack>

                            <Divider />

                            <BlockStack gap="400">
                                <BlockStack gap="200">
                                    <Text variant="headingMd" as="h3">1. Personal Information the App Collects</Text>
                                    <Text variant="bodyMd" as="p">
                                        When you install the App, we are automatically able to access certain types of information from your Shopify account:
                                    </Text>
                                    <Box paddingInlineStart="400">
                                        <List>
                                            <List.Item><strong>Shop Information:</strong> Shop domain, email, and owner details to facilitate communication.</List.Item>
                                            <List.Item><strong>Customer Data:</strong> Name, Email, Phone, and Address provided by your customers explicitly through the Request a Quote form.</List.Item>
                                            <List.Item><strong>Product Data:</strong> Information about products that are being quoted (titles, variants, prices).</List.Item>
                                        </List>
                                    </Box>
                                </BlockStack>

                                <BlockStack gap="200">
                                    <Text variant="headingMd" as="h3">2. How Do We Use Your Personal Information?</Text>
                                    <List>
                                        <List.Item>To facilitate the creation of Draft Orders based on customer quote requests.</List.Item>
                                        <List.Item>To send email notifications to you and your customers regarding new quotes.</List.Item>
                                        <List.Item>To provide support and improve the App's functionality.</List.Item>
                                    </List>
                                </BlockStack>

                                <BlockStack gap="200">
                                    <Text variant="headingMd" as="h3">3. Sharing Your Personal Information</Text>
                                    <Text variant="bodyMd" as="p">
                                        We do NOT sell or share your personal information or your customers' data with third parties for marketing purposes. Data is only shared with Shopify to ensure the app functions correctly (e.g., creating the Draft Order).
                                    </Text>
                                </BlockStack>

                                <BlockStack gap="200">
                                    <Text variant="headingMd" as="h3">4. Your Rights (GDPR/CPRA)</Text>
                                    <Text variant="bodyMd" as="p">
                                        We respect the "Right to be Forgotten" and "Data Portability." We have implemented mandatory Shopify webhooks to automatically handle data deletion and access requests.
                                    </Text>
                                </BlockStack>

                                <BlockStack gap="200">
                                    <Text variant="headingMd" as="h3">5. Data Retention</Text>
                                    <Text variant="bodyMd" as="p">
                                        Quote data is maintained in our records until you ask us to delete it or until you uninstall the app, at which point we follow standard Shopify data deletion protocols.
                                    </Text>
                                </BlockStack>
                            </BlockStack>
                        </BlockStack>
                    </Card>
                </Layout.Section>

                <Layout.Section variant="oneThird">
                    <Card>
                        <BlockStack gap="300">
                            <Text variant="headingMd" as="h3">Terms of Service</Text>
                            <Text variant="bodySm" tone="subdued" as="p">
                                By using this app, you agree that you are responsible for the pricing you offer via quotes and that all transactions must be finalized through Shopify Checkout.
                            </Text>
                            <Divider />
                            <Text variant="bodySm" tone="subdued" as="p">
                                Last updated: {new Date().toLocaleDateString()}
                            </Text>
                        </BlockStack>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    );
};
