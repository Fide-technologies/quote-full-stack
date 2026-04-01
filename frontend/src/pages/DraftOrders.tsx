import React from 'react';
import {
    Page,
    Layout,
    Card,
    BlockStack,
    Box,
    Text,
} from '@shopify/polaris';
import { ExportIcon } from '@shopify/polaris-icons';

import { useQuotes } from '../hooks/quotes/useQuotes';
import { QuoteFilters } from '../components/quotes/QuoteFilters';
import { QuoteTable } from '../components/quotes/QuoteTable';
import { useNavigate } from 'react-router-dom';

export const DraftOrders: React.FC = () => {
    const navigate = useNavigate();
    const {
        quotes,
        totalCount,
        totalPages,
        isLoading,
        queryValue,
        statusFilter,
        dateFilter,
        page,
        handleQueryChange,
        handleQueryClear,
        handleStatusChange,
        handleDateChange,
        handleClearAll,
        handleNextPage,
        handlePrevPage,
        handleSearchBlur,
    } = useQuotes({ hasDraftOrder: true });



    return (
        <Page
            title="Draft Orders"
            primaryAction={{
                content: 'Export CSV',
                icon: ExportIcon,
                onAction: () => {
                    window.open("/api/quotes/export?hasDraftOrder=true", "_blank");
                }
            }}
        >
            <Layout>
                <Layout.Section>
                    <BlockStack gap="400">
                        <Box paddingBlockEnd="400">
                            <BlockStack gap="100">
                                <Text variant="headingLg" as="h2">Manage converted quotes</Text>
                                <Text variant="bodyMd" tone="subdued" as="p">
                                    View and manage draft orders that have been created from customer requests.
                                </Text>
                            </BlockStack>
                        </Box>

                        <Card padding="0">
                            <QuoteFilters
                                queryValue={queryValue}
                                statusFilter={statusFilter}
                                dateFilter={dateFilter}
                                onQueryChange={handleQueryChange}
                                onQueryClear={handleQueryClear}
                                onStatusChange={handleStatusChange}
                                onDateChange={handleDateChange}
                                onClearAll={handleClearAll}
                                onSearch={handleSearchBlur}
                            />

                            <QuoteTable
                                quotes={quotes}
                                isLoading={isLoading}
                                page={page}
                                totalPages={totalPages}
                                totalCount={totalCount}
                                onNextPage={handleNextPage}
                                onPrevPage={handlePrevPage}
                                onViewDetails={(quote) => navigate(`/quotes/${quote.id}`)}
                            />
                        </Card>
                    </BlockStack>
                </Layout.Section>
            </Layout>
        </Page>
    );
};
