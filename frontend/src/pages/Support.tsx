import React from 'react';
import {
    Page,
    Layout,
    Card,
    BlockStack,
    Text,
    List,
    Link,
    Box,
    Button,
    InlineStack,
    Divider,
    Icon
} from '@shopify/polaris';
import { EmailIcon, ExternalIcon } from '@shopify/polaris-icons';

export const Support: React.FC = () => {
    return (
        <Page
            title="Help & Support"
            subtitle="Get guidance on setting up and using the Merchant Quote app."
        >
            <Box paddingBlockEnd="800">
                <Layout>
                <Layout.Section>
                    <BlockStack gap="400">
                        <Card>
                            <BlockStack gap="400">
                                <Text as="h2" variant="headingMd">Need help setting up?</Text>
                                <Text as="p" variant="bodyMd" tone="subdued">
                                    This page provides guidance on using the app features, including the Request Quote Button, 
                                    Custom Form Builder, and Quote Management System.
                                </Text>
                                <Text as="p" variant="bodyMd" tone="subdued">
                                    If you need additional assistance, you can follow the documentation below or contact our 
                                    support team directly.
                                </Text>
                                <Box paddingBlockStart="200">
                                    <Button 
                                        icon={EmailIcon} 
                                        url="mailto:krishnauday320@gmail.com"
                                        variant="primary"
                                    >
                                        Contact our support team
                                    </Button>
                                </Box>
                            </BlockStack>
                        </Card>

                        <Card>
                            <BlockStack gap="400">
                                <Text as="h2" variant="headingMd">How to show Quote Button on your product page</Text>
                                <BlockStack gap="300">
                                    <BlockStack gap="100">
                                        <Text as="h3" variant="headingSm" fontWeight="medium">App Embed Blocks (Recommended)</Text>
                                        <Text as="p" tone="subdued">
                                            The easiest way to show the quote button globally.
                                        </Text>
                                        <List>
                                            <List.Item>
                                                Go to your <Link url="shopify:admin/themes/current/editor" external><InlineStack gap="100" blockAlign="center">theme editor<Icon source={ExternalIcon} tone="base" /></InlineStack></Link>.
                                            </List.Item>
                                            <List.Item>
                                                Select the <strong>App embeds</strong> tab on the left sidebar.
                                            </List.Item>
                                            <List.Item>
                                                Enable the <strong>Merchant Quote</strong> extension.
                                            </List.Item>
                                            <List.Item>
                                                Click <strong>Save</strong> to apply changes to your live store.
                                            </List.Item>
                                        </List>
                                    </BlockStack>
                                    
                                    <Divider />
                                    
                                    <BlockStack gap="100">
                                        <Text as="h3" variant="headingSm" fontWeight="medium">Sections/Blocks (Custom Placement)</Text>
                                        <Text as="p" tone="subdued">
                                            Use this if you want to place the button at a specific location on your product template.
                                        </Text>
                                        <List>
                                            <List.Item>
                                                Open the theme editor and navigate to a product page.
                                            </List.Item>
                                            <List.Item>
                                                Click <strong>Add block</strong> in the Product Information section.
                                            </List.Item>
                                            <List.Item>
                                                Search for <strong>"Quote Button"</strong> and add it.
                                            </List.Item>
                                            <List.Item>
                                                Drag the block to your desired position and click <strong>Save</strong>.
                                            </List.Item>
                                        </List>
                                    </BlockStack>
                                </BlockStack>
                            </BlockStack>
                        </Card>
                    </BlockStack>
                </Layout.Section>

                <Layout.Section variant="oneThird">
                    <BlockStack gap="400">
                        <Card>
                            <BlockStack gap="300">
                                <Text as="h2" variant="headingMd">Support</Text>
                                <BlockStack gap="050">
                                    <InlineStack gap="200" blockAlign="center" align="start">
                                        <Icon source={EmailIcon} tone="subdued" />
                                        <Text as="span" tone="subdued">Email us at:</Text>
                                    </InlineStack>
                                    <InlineStack align="start">
                                        <Link url="mailto:krishnauday320@gmail.com" external>
                                            krishnauday320@gmail.com
                                        </Link>
                                    </InlineStack>
                                </BlockStack>
                                <Divider />
                                <Box>
                                    <Text as="p" variant="bodySm" tone="subdued">
                                        Response time: Usually within 24 hours (Monday to Friday).
                                    </Text>
                                </Box>
                            </BlockStack>
                        </Card>

                        <Card>
                            <BlockStack gap="300">
                                <Text as="h2" variant="headingMd">Documentation</Text>
                                <Text as="p" variant="bodyMd" tone="subdued">
                                    Check our knowledge base for detailed guides and troubleshooting.
                                </Text>
                                <InlineStack align="start">
                                    <Button icon={ExternalIcon} variant="plain">
                                        View Full Documentation
                                    </Button>
                                </InlineStack>
                            </BlockStack>
                        </Card>
                    </BlockStack>
                </Layout.Section>
            </Layout>
            </Box>
        </Page>
    );
};
