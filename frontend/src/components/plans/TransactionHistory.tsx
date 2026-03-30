import React, { useState } from 'react';
import { Card, IndexTable, Text, BlockStack, Badge, Box, EmptyState, Pagination, InlineStack, Button } from '@shopify/polaris';
import { useQuery } from '@tanstack/react-query';
import { getChargeHistory } from '../../api/plans';
import { formatPricingDetails, formatChargeDate, getChargeStatusTone } from '../../utils/billingFormatters';

export const TransactionHistory: React.FC = () => {
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    const { data: rawData, isLoading, isError } = useQuery({
        queryKey: ["chargeHistory"],
        queryFn: getChargeHistory,
    });

    if (isLoading) {
        return (
            <Card>
                <Box padding="400">
                    <Text as="p" tone="subdued">Loading transaction history...</Text>
                </Box>
            </Card>
        );
    }

    if (isError) {
        return (
            <Card>
                <Box padding="400">
                    <Text as="p" tone="critical">Unable to load transaction history. Please refresh the page.</Text>
                </Box>
            </Card>
        );
    }

    // Combine subscriptions and oneTimePurchases for a full history
    const allItems = [
        ...(rawData?.subscriptions || []),
        ...(rawData?.oneTimePurchases || [])
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (allItems.length === 0) {
        return (
            <Card>
                <EmptyState
                    heading="No transactions yet"
                    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                    <p>Once you subscribe to a plan, your billing history will appear here.</p>
                </EmptyState>
            </Card>
        );
    }

    const totalPages = Math.ceil(allItems.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const paginatedItems = allItems.slice(startIndex, startIndex + itemsPerPage);

    const resourceName = {
        singular: 'transaction',
        plural: 'transactions',
    };

    const rowMarkup = paginatedItems.map((item: any, index: number) => {
        const { price, currency, detail } = formatPricingDetails(item);
        const formattedDate = formatChargeDate(item.createdAt);
        const status = item.status.toUpperCase();
        const statusTone = getChargeStatusTone(status);

        return (
            <IndexTable.Row id={item.id} key={item.id} position={index}>
                <IndexTable.Cell>
                    <Text variant="bodyMd" fontWeight="bold" as="span">
                        {item.name}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Text variant="bodyMd" as="span" tone="subdued">
                        {formattedDate}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <InlineStack align="end">
                        <BlockStack gap="0" align="end">
                            <Text variant="bodyMd" as="span" fontWeight="semibold">
                                {price} {currency}
                            </Text>
                            <Text variant="bodySm" as="span" tone="subdued">
                                {detail}
                            </Text>
                        </BlockStack>
                    </InlineStack>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <InlineStack align="end">
                        <Badge tone={statusTone}>{status}</Badge>
                    </InlineStack>
                </IndexTable.Cell>
            </IndexTable.Row>
        );
    });

    return (
        <Card padding="0">
            <Box padding="400">
                <InlineStack align="space-between" blockAlign="center">
                    <BlockStack gap="100">
                        <Text as="h2" variant="headingMd">Billing History</Text>
                        <Text as="p" tone="subdued">Detailed view of your app subscriptions and one-time charges.</Text>
                    </BlockStack>
                    <Button 
                        variant="tertiary" 
                        url={`https://${new URLSearchParams(window.location.search).get('shop')}/admin/settings/billing/charges`}
                        external
                    >
                        View in Shopify admin
                    </Button>
                </InlineStack>
            </Box>
            
            <IndexTable
                resourceName={resourceName}
                itemCount={allItems.length}
                headings={[
                    { title: 'Resource' },
                    { title: 'Date' },
                    { title: 'Amount', alignment: 'end' },
                    { title: 'Status', alignment: 'end' },
                ]}
                selectable={false}
            >
                {rowMarkup}
            </IndexTable>

            {totalPages > 1 && (
                <Box padding="400">
                    <InlineStack align="center">
                        <Pagination
                            hasPrevious={page > 1}
                            onPrevious={() => setPage(page - 1)}
                            hasNext={page < totalPages}
                            onNext={() => setPage(page + 1)}
                            label={`Page ${page} of ${totalPages}`}
                        />
                    </InlineStack>
                </Box>
            )}
        </Card>
    );
};
