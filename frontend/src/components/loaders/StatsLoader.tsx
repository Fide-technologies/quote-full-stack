import React from 'react';
import { Card, Grid, BlockStack, SkeletonDisplayText } from '@shopify/polaris';

export const StatsLoader: React.FC<{ columns?: number }> = ({ columns = 4 }) => {
    return (
        <Grid>
            {Array.from({ length: columns }).map((_, i) => (
                <Grid.Cell key={i} columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
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
