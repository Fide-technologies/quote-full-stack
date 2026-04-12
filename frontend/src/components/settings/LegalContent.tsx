import React from "react";
import { BlockStack, Text, Box, List, Divider, Card, Badge, InlineStack } from "@shopify/polaris";

export const LegalContent: React.FC = () => {
    return (
        <BlockStack gap="600">
            <Card>
                <BlockStack gap="500">
                    <BlockStack gap="200">
                        <InlineStack align="start">
                            <Badge tone="success">Official Policy</Badge>
                        </InlineStack>
                        <Text variant="headingLg" as="h2">Privacy Policy</Text>
                        <Text variant="bodyMd" as="p" tone="subdued">
                            Last Modified: April 12, 2026
                        </Text>
                        <Text variant="bodyMd" as="p">
                            This Privacy Policy describes how your personal information is managed when you use the <strong>Merchant Quote</strong> App in connection with your Shopify store.
                        </Text>
                    </BlockStack>

                    <Divider />

                    <BlockStack gap="400">
                        <BlockStack gap="200">
                            <Text variant="headingMd" as="h3">1. Personal Information We Collect</Text>
                            <Text variant="bodyMd" as="p">
                                We access specific data via Shopify's secure systems to operate the service:
                            </Text>
                            <Box paddingInlineStart="400">
                                <List>
                                    <List.Item><strong>Merchant Profile:</strong> Basic shop details and admin contact info.</List.Item>
                                    <List.Item><strong>Customer Information:</strong> Names, emails, and contact details from quote requests.</List.Item>
                                    <List.Item><strong>Visual Assets:</strong> Any image attachments or files uploaded as part of a quote.</List.Item>
                                    <List.Item><strong>Product Data:</strong> Store product details required to generate accurate price requests.</List.Item>
                                </List>
                            </Box>
                        </BlockStack>

                        <BlockStack gap="200">
                            <Text variant="headingMd" as="h3">2. Purpose of Data Usage</Text>
                            <Text variant="bodyMd" as="p">
                                We process data strictly to provide the app's functionality:
                            </Text>
                            <List>
                                <List.Item>Managing custom price negotiations and quote records.</List.Item>
                                <List.Item><strong>Platform Integration:</strong> Automatically generating Draft Orders in your Shopify Admin.</List.Item>
                                <List.Item><strong>Notifications:</strong> Sending status updates to you and your customers.</List.Item>
                                <List.Item><strong>Support:</strong> Resolving technical issues and maintaining app stability.</List.Item>
                            </List>
                        </BlockStack>

                        <BlockStack gap="200">
                            <Text variant="headingMd" as="h3">3. External Service Providers</Text>
                            <Text variant="bodyMd" as="p">
                                We only share information with partners required for the app's core operations:
                            </Text>
                            <List>
                                <List.Item><strong>Shopify:</strong> The hosting platform for your store and our application.</List.Item>
                                <List.Item><strong>Secure Infrastructure:</strong> Certified cloud storage and database providers used to host your quote history and customer files.</List.Item>
                            </List>
                            <Text variant="bodyMd" as="p">
                                We <strong>DO NOT</strong> sell or trade your store or customer information.
                            </Text>
                        </BlockStack>

                        <BlockStack gap="200">
                            <Text variant="headingMd" as="h3">4. Data Deletion & Retention</Text>
                            <Text variant="bodyMd" as="p">
                                We respect merchant and customer privacy through automated deletion protocols:
                            </Text>
                            <List>
                                <List.Item><strong>Uninstallation:</strong> Data is kept for 48 hours for recovery purposes, then queued for permanent removal.</List.Item>
                                <List.Item><strong>Official Requests:</strong> We honor all mandatory Shopify platform data redaction and deletion requests.</List.Item>
                            </List>
                        </BlockStack>

                        <BlockStack gap="200">
                            <Text variant="headingMd" as="h3">5. Legal Rights & Compliance</Text>
                            <Text variant="bodyMd" as="p">
                                We comply with global standards including GDPR and CCPA. Merchants and customers can request data access or deletion via our support channel.
                            </Text>
                        </BlockStack>

                        <BlockStack gap="200">
                            <Text variant="headingMd" as="h3">6. Support Contact</Text>
                            <Text variant="bodyMd" as="p">
                                For inquiries about our privacy practices, contact us at <strong>fidetechonologies@gmail.com</strong>.
                            </Text>
                        </BlockStack>
                    </BlockStack>
                </BlockStack>
            </Card>

            {/* Terms of Service Section */}
            <Card>
                <BlockStack gap="400">
                    <Text variant="headingLg" as="h2">Terms of Service</Text>
                    <BlockStack gap="300">
                        <Text variant="bodyMd" as="p">
                            By using the <strong>Merchant Quote</strong> App, you agree to these terms:
                        </Text>
                        <List>
                            <List.Item><strong>Policy:</strong> Finalized quote transactions must be processed via Shopify Checkout.</List.Item>
                            <List.Item><strong>Responsibility:</strong> Merchants control all pricing and discounts offered.</List.Item>
                            <List.Item><strong>Liability:</strong> Fide Technologies is not liable for indirect damages or external platform outages.</List.Item>
                            <List.Item><strong>Service Agreement:</strong> Usage constitutes agreement to our Privacy Policy.</List.Item>
                        </List>
                    </BlockStack>
                </BlockStack>
            </Card>
        </BlockStack>
    );
};
