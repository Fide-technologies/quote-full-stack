import { Card, Layout, SkeletonBodyText, SkeletonPage } from '@shopify/polaris';
import type React from 'react';
import { StatsLoader } from './StatsLoader';

interface DashboardLoaderProps {
  title?: string;
}

export const DashboardLoader: React.FC<DashboardLoaderProps> = ({ title = 'Dashboard' }) => {
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
