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
import { EmailIcon, ChatIcon, PersonIcon, ExternalIcon } from '@shopify/polaris-icons';

export const Support: React.FC = () => {
    return (
        <Page
            title="Help & Support"
            subtitle="Get guidance on setting up and using the Merchant Quote app."
        >
            <Box paddingBlockStart="400" paddingBlockEnd="800">
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
                                            url="https://mail.google.com/mail/?view=cm&fs=1&to=krishnauday320@gmail.com&su=Support%20Request%20-%20Merchant%20Quote&body=Hello%20Support%20Team,%0A%0AI%20need%20help%20with..."
                                            variant="primary"
                                            external
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
                                <BlockStack gap="500">
                                    <BlockStack gap="400">
                                        <InlineStack gap="200" align="start" blockAlign="center">
                                            <div style={{ width: '20px', display: 'flex', justifyContent: 'center' }}>
                                                <Icon source={ChatIcon} tone="info" />
                                            </div>
                                            <Text as="h2" variant="headingMd">Direct Support</Text>
                                        </InlineStack>

                                        <BlockStack gap="400">
                                            <InlineStack gap="200" align="start">
                                                <div style={{ width: '20px' }} />
                                                <BlockStack gap="100">
                                                    <Text as="p" variant="bodySm" fontWeight="medium" tone="subdued">
                                                        FOR QUESTIONS OR ASSISTANCE
                                                    </Text>
                                                    <Link url="https://mail.google.com/mail/?view=cm&fs=1&to=krishnauday320@gmail.com&su=Support%20Request%20-%20Merchant%20Quote&body=Hello%20Support%20Team,%0A%0AI%20need%20help%20with..." external>
                                                        <Text as="span" variant="bodyMd" fontWeight="semibold">
                                                            krishnauday320@gmail.com
                                                        </Text>
                                                    </Link>
                                                </BlockStack>
                                            </InlineStack>

                                            <Divider />

                                            <InlineStack gap="200" align="start" blockAlign="start">
                                                <div style={{ width: '20px', display: 'flex', justifyContent: 'center', paddingTop: '4px' }}>
                                                    <Icon source={PersonIcon} tone="subdued" />
                                                </div>
                                                <BlockStack gap="050">
                                                    <Text as="p" variant="bodySm" tone="subdued">
                                                        Response time: Within 24 hours
                                                    </Text>
                                                    <Text as="p" variant="bodySm" tone="subdued">
                                                        Monday to Friday
                                                    </Text>
                                                </BlockStack>
                                            </InlineStack>
                                        </BlockStack>
                                    </BlockStack>
                                </BlockStack>
                            </Card>
                        </BlockStack>
                    </Layout.Section>
                </Layout>
            </Box>
        </Page>
    );
};
