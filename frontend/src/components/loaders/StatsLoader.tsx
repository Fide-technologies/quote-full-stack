import { BlockStack, Card, Grid, SkeletonDisplayText } from '@shopify/polaris';
import type React from 'react';

export const StatsLoader: React.FC<{ columns?: number }> = ({ columns = 4 }) => {
  return (
    <Grid>
      {['s1', 's2', 's3', 's4'].slice(0, columns).map((key) => (
        <Grid.Cell key={key} columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
          <Card>
            <BlockStack gap="200">
              <SkeletonDisplayText size="small" />
              <SkeletonDisplayText size="medium" />
            </BlockStack>
          </Card>
        </Grid.Cell>
      ))}
    </Grid>
  );
};
