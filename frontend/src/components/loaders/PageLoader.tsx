import React from 'react';
import {
    SkeletonPage,
    Layout,
    Card,
    BlockStack,
    SkeletonBodyText,
    SkeletonDisplayText,
    Divider,
} from '@shopify/polaris';

interface PageLoaderProps {
    title?: string;
    hasSidebar?: boolean;
    primaryAction?: boolean;
    backAction?: boolean;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
    title = "Loading...",
    hasSidebar = false,
    primaryAction = false,
    backAction = false
}) => {
    return (
        <SkeletonPage title={title} primaryAction={primaryAction} backAction={backAction}>
            <Layout>
                <Layout.Section>
                    <BlockStack gap="400">
                        <Card>
                            <BlockStack gap="400">
                                <SkeletonDisplayText size="medium" />
                                <Divider />
                                <SkeletonBodyText lines={5} />
                            </BlockStack>
                        </Card>
                        <Card>
                            <BlockStack gap="400">
                                <SkeletonDisplayText size="small" />
                                <SkeletonBodyText lines={3} />
                            </BlockStack>
                        </Card>
                    </BlockStack>
                </Layout.Section>
                {hasSidebar && (
                    <Layout.Section variant="oneThird">
                        <BlockStack gap="400">
                            <Card>
                                <BlockStack gap="400">
                                    <SkeletonDisplayText size="small" />
                                    <SkeletonBodyText lines={4} />
                                </BlockStack>
                            </Card>
                            <Card>
                                <BlockStack gap="400">
                                    <SkeletonDisplayText size="small" />
                                    <SkeletonBodyText lines={2} />
                                </BlockStack>
                            </Card>
                        </BlockStack>
                    </Layout.Section>
                )}
            </Layout>
        </SkeletonPage>
    );
};
