import React, { useState, useEffect } from 'react';
import {
    Page,
    Layout,
    Card,
    BlockStack,
    Box,
    Text,
    Banner,
} from '@shopify/polaris';
import { ExportIcon } from '@shopify/polaris-icons';

import { useQuotes } from '../hooks/quotes/useQuotes';
import { usePlanUsage } from '../hooks/usePlanUsage';
import { useNavigate } from 'react-router-dom';
import { QuoteFilters } from '../components/quotes/QuoteFilters';
import { QuoteTable } from '../components/quotes/QuoteTable';
import { QuoteDetailsModal } from '../components/quotes/QuoteDetailsModal';

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
        selectedQuote,
        isModalOpen,
        handleQueryChange,
        handleQueryClear,
        handleStatusChange,
        handleDateChange,
        handleClearAll,
        handleNextPage,
        handlePrevPage,
        handleSearchBlur,
        openDetails,
        closeModal
    } = useQuotes();

    const navigate = useNavigate();
    const { isUsageExceeded, usage, isLoading: isPlanLoading } = usePlanUsage();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    return (
        <Page
            title="Quote Requests"
            primaryAction={{
                content: 'Export CSV',
                icon: ExportIcon,
                onAction: () => {
                    window.open("/api/quotes/export", "_blank");
                }
            }}
        >
            <Layout>
                <Layout.Section>
                    <BlockStack gap="400">
                        {isUsageExceeded() && !isPlanLoading && (
                            <Banner
                                tone="critical"
                                title="Quote limit reached"
                                action={{
                                    content: 'Upgrade Plan',
                                    onAction: () => navigate('/plans')
                                }}
                            >
                                <p>
                                    You have reached your limit of {usage?.plan?.quoteLimit} quotes for the current plan.
                                    New quotes will not be captured until you upgrade or your cycle resets.
                                </p>
                            </Banner>
                        )}

                        <Box paddingBlockEnd="400">
                            <BlockStack gap="100">
                                <Text variant="headingLg" as="h2">Manage your inquiries</Text>
                                <Text variant="bodyMd" tone="subdued" as="p">
                                    Track and respond to price requests from your customers in one place.
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
                                onViewDetails={openDetails}
                            />
                        </Card>
                    </BlockStack>
                </Layout.Section>
            </Layout>

            <QuoteDetailsModal
                quote={selectedQuote}
                isOpen={isModalOpen}
                onClose={closeModal}
            />
        </Page>
    );
};
