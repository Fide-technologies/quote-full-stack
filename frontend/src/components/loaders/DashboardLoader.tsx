import React from "react";
import { SkeletonPage, Layout, Card, SkeletonBodyText } from "@shopify/polaris";
import { StatsLoader } from "./StatsLoader";

interface DashboardLoaderProps {
    title?: string;
}

export const DashboardLoader: React.FC<DashboardLoaderProps> = ({ title = "Dashboard" }) => {
    return (
        <SkeletonPage title={title}>
            <Layout>
                <Layout.Section>
                    <Card>
                        <SkeletonBodyText lines={3} />
                    </Card>
                    <StatsLoader columns={4} />
                </Layout.Section>
                <Layout.Section variant="oneThird">
                    <Card padding="400">
                        <SkeletonBodyText lines={5} />
                    </Card>
                </Layout.Section>
            </Layout>
        </SkeletonPage>
    );
};
