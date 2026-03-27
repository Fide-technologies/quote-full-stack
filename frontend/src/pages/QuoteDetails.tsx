import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    Page,
    Layout,
    Card,
    BlockStack,
    Text,
    Banner,
    Divider,
    Badge,
    Box
} from '@shopify/polaris';
import { getQuoteById } from '../api/quotes';
import { QuoteCustomerDetails } from '../components/quotes/details/QuoteCustomerDetails';
import { QuoteAddressDetails } from '../components/quotes/details/QuoteAddressDetails';
import { QuoteProductDetails } from '../components/quotes/details/QuoteProductDetails';
import { QuoteMessage } from '../components/quotes/details/QuoteMessage';
import { QuoteDraftOrderInfo } from '../components/quotes/details/QuoteDraftOrderInfo';
import { QuoteSystemInfo } from '../components/quotes/details/QuoteSystemInfo';
import { QuoteCustomDataDetails } from '../components/quotes/details/QuoteCustomDataDetails';
import { QuoteImages } from '../components/quotes/details/QuoteImages';
import { useQuoteDraftOrder } from '../hooks/useQuoteDraftOrder';
import { generateWhatsAppUrl } from '../utils/whatsapp';
import { PageLoader } from '../components/loaders/PageLoader';

export const QuoteDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: quote, isLoading: loading, error: queryError } = useQuery({
        queryKey: ['quote', id],
        queryFn: () => getQuoteById(id!),
        enabled: !!id
    });

    const {
        handleCreateDraftOrder,
        isPending,
        isPro,
        isSettingsLoading,
        error: draftError,
        success,
        currentDraftOrderUrl,
        setError,
        setSuccess
    } = useQuoteDraftOrder({ quote: quote || null });

    if (loading) {
        return <PageLoader title="Quote #..." backAction hasSidebar />;
    }

    if (queryError || !quote) {
        return (
            <Page
                backAction={{ content: 'Quotes', onAction: () => navigate('/quotes') }}
                title="Quote Not Found"
            >
                <Layout>
                    <Layout.Section>
                        <Banner tone="critical">
                            <p>The quote you are looking for does not exist or could not be loaded.</p>
                        </Banner>
                    </Layout.Section>
                </Layout>
            </Page>
        );
    }

    const whatsappUrl = generateWhatsAppUrl(
        quote.phone || '',
        quote.firstName,
        quote.productTitle,
        `Hi ${quote.firstName}, I'm following up regarding your quote #${quote.id.slice(-6).toUpperCase()} for ${quote.productTitle || 'item'}.`
    );

    return (
        <Page
            backAction={{ content: 'Quotes', onAction: () => navigate('/quotes') }}
            title={`Quote #${quote.id.slice(-6).toUpperCase()}`}
            titleMetadata={<Badge tone={quote.status === 'NEW' ? 'attention' : 'info'}>{quote.status}</Badge>}
            primaryAction={
                currentDraftOrderUrl
                    ? {
                        content: 'View Invoice',
                        onAction: () => window.open(currentDraftOrderUrl, '_blank'),
                    }
                    : {
                        content: isSettingsLoading ? 'Loading...' : (isPro ? 'Create Draft Order' : 'Upgrade to Create Order'),
                        onAction: isPro ? () => handleCreateDraftOrder() : () => navigate('/plans'),
                        loading: isPending || isSettingsLoading,
                        disabled: isPending || isSettingsLoading,
                    }
            }
        >
            <Box paddingBlockEnd="800">
                <Layout>
                    <Layout.Section>
                        <BlockStack gap="400">
                            {draftError && (
                                <Banner tone="critical" onDismiss={() => setError(null)}>
                                    {draftError}
                                </Banner>
                            )}
                            {success && (
                                <Banner tone="success" onDismiss={() => setSuccess(null)}>
                                    {success}
                                </Banner>
                            )}

                            <Card>
                                <BlockStack gap="500">
                                    <QuoteProductDetails
                                        productTitle={quote.productTitle}
                                        variantTitle={quote.variantTitle || null}
                                        quantity={quote.quantity}
                                        featuredImage={quote.productDetails?.featuredImage || null}
                                    />
                                    <Divider />
                                    <QuoteMessage message={quote.customerMessage || null} />
                                </BlockStack>
                            </Card>

                            {(quote.customData || (quote.customImages && quote.customImages.length > 0)) && (
                                <Card>
                                    <BlockStack gap="400">
                                        <Text as="h2" variant="headingMd">Custom Submission Data</Text>
                                        <QuoteCustomDataDetails customData={quote.customData} />
                                        <QuoteImages images={quote.customImages} />
                                    </BlockStack>
                                </Card>
                            )}
                        </BlockStack>
                    </Layout.Section>

                    <Layout.Section variant="oneThird">
                        <BlockStack gap="400">
                            <Card>
                                <BlockStack gap="400">
                                    <Text as="h2" variant="headingMd">Customer</Text>
                                    <QuoteCustomerDetails
                                        firstName={quote.firstName}
                                        lastName={quote.lastName}
                                        email={quote.email}
                                        phone={quote.phone || ''}
                                        whatsappUrl={whatsappUrl}
                                    />
                                    <Divider />
                                    <QuoteAddressDetails
                                        address1={quote.address1}
                                        address2={quote.address2 || null}
                                        city={quote.city}
                                        district={quote.district}
                                        state={quote.state}
                                        pincode={quote.pincode}
                                    />
                                </BlockStack>
                            </Card>

                            <Card>
                                <BlockStack gap="400">
                                    <Text as="h2" variant="headingMd">System Information</Text>
                                    <QuoteSystemInfo
                                        status={quote.status}
                                        createdAt={quote.createdAt}
                                    />
                                    {quote.draftOrderId && (
                                        <>
                                            <Divider />
                                            <QuoteDraftOrderInfo
                                                draftOrderId={quote.draftOrderId || null}
                                                draftOrderUrl={currentDraftOrderUrl || quote.draftOrderUrl}
                                            />
                                        </>
                                    )}
                                </BlockStack>
                            </Card>
                        </BlockStack>
                    </Layout.Section>
                </Layout>
            </Box>
        </Page>
    );
};
