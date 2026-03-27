import React, { useState, useEffect } from 'react';
import {
    Page,
    Layout,
    Card,
    BlockStack,
    Banner,
    Box,
    Text,
    Divider
} from '@shopify/polaris';
import { ExportIcon } from '@shopify/polaris-icons';
import { useQuotes } from '../hooks/quotes/useQuotes';
import { usePlanUsage } from '../hooks/usePlanUsage';
import { useNavigate } from 'react-router-dom';
import { QuoteFilters } from '../components/quotes/QuoteFilters';
import { QuoteTable } from '../components/quotes/QuoteTable';
import { PageLoader } from '../components/loaders/PageLoader';

export const Quotes: React.FC = () => {
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
    } = useQuotes();

    const navigate = useNavigate();
    const { isUsageExceeded, usage, isLoading: isPlanLoading } = usePlanUsage();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient || isLoading) {
        return <PageLoader title="Quote Requests" primaryAction />;
    }

    return (
        <Page
            title="Quote Requests"
            primaryAction={{
                content: 'Export CSV',
                icon: ExportIcon,
                onAction: async () => {
                    try {
                        const { exportQuotesCSV } = await import('../api/quotes');
                        await exportQuotesCSV({ 
                            q: queryValue, 
                            status: statusFilter?.length ? statusFilter[0] : undefined,
                            date: dateFilter 
                        });
                        if (typeof shopify !== 'undefined') shopify.toast.show('Quotes exported successfully');
                    } catch (error) {
                        console.error("Export error", error);
                        if (typeof shopify !== 'undefined') shopify.toast.show('Failed to export quotes', { isError: true });
                    }
                }
            }}
        >
            <Box paddingBlockEnd="800">
                <Layout>
                    <Layout.Section>
                        <BlockStack gap="400">
                            {isUsageExceeded() && !isPlanLoading && (
                                <Banner
                                    title="Plan limit reached"
                                    tone="warning"
                                    action={{ content: 'Upgrade Plan', onAction: () => navigate('/plans') }}
                                >
                                    <p>You have reached your monthly quote limit ({usage?.plan?.quoteLimit || 0}). Please upgrade your plan to continue receiving new quotes.</p>
                                </Banner>
                            )}

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
                                    totalCount={totalCount}
                                    page={page}
                                    totalPages={totalPages}
                                    onNextPage={handleNextPage}
                                    onPrevPage={handlePrevPage}
                                    onViewDetails={(quote) => navigate(`/quotes/${quote.id}`)}
                                />
                            </Card>
                        </BlockStack>
                    </Layout.Section>

                    <Layout.Section variant="oneThird">
                        <BlockStack gap="400">
                            <Card>
                                <BlockStack gap="200">
                                    <Text as="h2" variant="headingMd">Summary</Text>
                                    <Divider />
                                    <Box paddingBlockStart="200">
                                        <BlockStack gap="200">
                                            <Box>
                                                <Text as="p" variant="bodyMd">Total Quotes: {totalCount}</Text>
                                            </Box>
                                            <Box>
                                                <Text as="p" variant="bodyMd">Pending: {quotes.filter(q => q.status === 'NEW').length}</Text>
                                            </Box>
                                        </BlockStack>
                                    </Box>
                                </BlockStack>
                            </Card>
                        </BlockStack>
                    </Layout.Section>
                </Layout>
            </Box>
        </Page>
    );
};
