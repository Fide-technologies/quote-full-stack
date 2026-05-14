import { Banner, BlockStack, Box, Card, InlineGrid, Layout, Page, Text } from '@shopify/polaris';
import { ExportIcon } from '@shopify/polaris-icons';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorState } from '../components/common/ErrorState';
import { PageLoader } from '../components/loaders/PageLoader';
import { QuoteFilters } from '../components/quotes/QuoteFilters';
import { QuoteTable } from '../components/quotes/QuoteTable';
import { useQuotes } from '../hooks/quotes/useQuotes';
import { usePlanUsage } from '../hooks/usePlanUsage';

export const Quotes: React.FC = () => {
  const {
    quotes,
    totalCount,
    totalPages,
    isLoading,
    isError,
    error,
    refetch,
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
    const timer = setTimeout(() => setIsClient(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isClient || isLoading) {
    return <PageLoader title="Quote Requests" primaryAction />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Quote Requests"
        message={(error as Error)?.message || 'Something went wrong while fetching your quotes.'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <Page
      title="Quote Requests"
      primaryAction={{
        content: 'Export CSV',
        icon: ExportIcon,
        onAction: async () => {
          try {
            const { exportQuotesCSV } = await import('../api/quotes/export');
            await exportQuotesCSV({
              q: queryValue,
              status: statusFilter?.length ? statusFilter[0] : undefined,
              date: dateFilter,
            });
            if (typeof shopify !== 'undefined') shopify.toast.show('Quotes exported successfully');
          } catch (error) {
            console.error('Export error', error);
            if (typeof shopify !== 'undefined')
              shopify.toast.show('Failed to export quotes', { isError: true });
          }
        },
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
                  <p>
                    You have reached your monthly quote limit ({usage?.plan?.quoteLimit || 0}).
                    Please upgrade your plan to continue receiving new quotes.
                  </p>
                </Banner>
              )}

              <InlineGrid columns={{ xs: 1, sm: 2 }} gap="400">
                <Card>
                  <BlockStack gap="200">
                    <Text as="h2" variant="headingSm" tone="subdued">
                      Total Quotes
                    </Text>
                    <Text as="p" variant="headingLg">
                      {totalCount}
                    </Text>
                  </BlockStack>
                </Card>
                <Card>
                  <BlockStack gap="200">
                    <Text as="h2" variant="headingSm" tone="subdued">
                      Pending Quotes
                    </Text>
                    <Text as="p" variant="headingLg">
                      {quotes.filter((q) => q.status === 'PENDING').length}
                    </Text>
                  </BlockStack>
                </Card>
              </InlineGrid>

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
        </Layout>
      </Box>
    </Page>
  );
};
