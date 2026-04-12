import React, { useState } from 'react';
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
    Box,
} from '@shopify/polaris';
import { PageLoader } from '../components/loaders/PageLoader';
import { QuoteWhatsAppContact } from '../components/quotes/details/QuoteWhatsAppContact';
import { QuoteCustomerDetails } from '../components/quotes/details/QuoteCustomerDetails';
import { QuoteAddressDetails } from '../components/quotes/details/QuoteAddressDetails';
import { QuoteProductDetails } from '../components/quotes/details/QuoteProductDetails';
import { QuoteMessage } from '../components/quotes/details/QuoteMessage';
import { QuoteDraftOrderInfo } from '../components/quotes/details/QuoteDraftOrderInfo';
import { QuoteSystemInfo } from '../components/quotes/details/QuoteSystemInfo';
import { QuoteCustomDataDetails } from '../components/quotes/details/QuoteCustomDataDetails';
import { QuoteImages } from '../components/quotes/details/QuoteImages';
import { QuoteFullProductDetails } from '../components/quotes/details/QuoteFullProductDetails';

// Modals
import { QuoteAcceptModal } from '../components/quotes/modals/QuoteAcceptModal';
import { QuoteRejectModal } from '../components/quotes/modals/QuoteRejectModal';
import { QuoteDeleteModal } from '../components/quotes/modals/QuoteDeleteModal';

// Hooks
import { getQuoteById } from '../api/quotes';
import { useQuoteDraftOrder } from '../hooks/useQuoteDraftOrder';
import { useQuoteAccept } from '../hooks/useQuoteAccept';
import { useQuoteManagement } from '../hooks/useQuoteManagement';
import { useQuoteReject, REJECTION_REASONS } from '../hooks/useQuoteReject';

import { ErrorState } from '../components/common/ErrorState';

export const QuoteDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const { data: quote, isLoading: loading, error: queryError } = useQuery({
        queryKey: ['quote', id],
        queryFn: () => getQuoteById(id!),
        enabled: !!id
    });

    const {
        handleCreateDraftOrder,
        isPending: isDraftPending,
        isPro,
        isSettingsLoading,
        error: draftError,
        success: draftSuccess,
        currentDraftOrderUrl,
        setError: setDraftError,
        setSuccess: setDraftSuccess
    } = useQuoteDraftOrder({ quote: quote || null });

    const {
        isModalOpen: isAcceptModalOpen,
        openModal: openAcceptModal,
        closeModal: closeAcceptModal,
        price,
        setPrice,
        quantity,
        setQuantity,
        currency,
        setCurrency,
        message: acceptMessage,
        setMessage: setAcceptMessage,
        handleAccept,
        formatCurrency,
        isPending: isAcceptPending,
        error: acceptError,
        setError: setAcceptError,
        success: acceptSuccess,
        setSuccess: setAcceptSuccess
    } = useQuoteAccept({ quote: quote || null });

    const {
        handleDelete,
        handleStatusChange,
        isDeleting,
        error: mgmtError,
        setError: setMgmtError,
        success: mgmtSuccess,
        setSuccess: setMgmtSuccess
    } = useQuoteManagement();

    const {
        isModalOpen: isRejectModalOpen,
        openModal: openRejectModal,
        closeModal: closeRejectModal,
        selectedReason,
        setSelectedReason,
        customMessage: rejectCustomMessage,
        setCustomMessage: setRejectCustomMessage,
        handleReject,
        isPending: isRejectPending,
        error: rejectError,
        success: rejectSuccess,
        setError: setRejectError,
        setSuccess: setRejectSuccess
    } = useQuoteReject({ quote: quote || null });

    if (loading) return <PageLoader title="Quote #..." backAction hasSidebar />;

    if (queryError || !quote) {
        return (
            <ErrorState 
                title="Quote Not Found"
                message="The quote you are looking for does not exist or could not be loaded."
                backAction={{ content: 'Quotes', onAction: () => navigate('/quotes') }}
                onRetry={queryError ? () => window.location.reload() : undefined}
            />
        );
    }

    const clearStatus = () => {
        setDraftError(null); setAcceptError(null); setMgmtError(null); setRejectError(null);
        setDraftSuccess(null); setAcceptSuccess(null); setMgmtSuccess(null); setRejectSuccess(null);
    };

    return (
        <Page
            backAction={{ content: 'Quotes', onAction: () => navigate('/quotes') }}
            title={`Quote #${quote.id.slice(-6).toUpperCase()}`}
            titleMetadata={<Badge tone={quote.status === 'APPROVED' ? 'success' : quote.status === 'NEW' ? 'attention' : 'info'}>{quote.status}</Badge>}
            primaryAction={
                currentDraftOrderUrl
                    ? { content: 'View Invoice', onAction: () => window.open(currentDraftOrderUrl, '_blank') }
                    : {
                        content: isSettingsLoading ? 'Loading...' : (isPro ? 'Create Draft Order' : 'Upgrade to Create Order'),
                        onAction: isPro ? handleCreateDraftOrder : () => navigate('/plans'),
                        loading: isDraftPending || isSettingsLoading,
                        disabled: isDraftPending || isSettingsLoading,
                    }
            }
            secondaryActions={[
                ...(quote.draftOrderId ? [] : [
                    { content: 'Accept & Email', onAction: openAcceptModal, disabled: quote.status === 'APPROVED' },
                    { content: 'Reject & Email', onAction: openRejectModal, disabled: quote.status === 'APPROVED' },
                ]),
                { content: 'Delete Quote', destructive: true, onAction: () => setIsDeleteModalOpen(true), loading: isDeleting }
            ]}
            actionGroups={quote.draftOrderId ? [] : [
                {
                    title: 'Update Status',
                    actions: [
                        { content: 'Mark as Pending', onAction: () => handleStatusChange(quote.id, 'PENDING') },
                        { content: 'Mark as Negotiating', onAction: () => handleStatusChange(quote.id, 'NEGOTIATION') },
                        { content: 'Mark as Approved', onAction: () => handleStatusChange(quote.id, 'APPROVED') },
                        { content: 'Mark as Rejected', onAction: () => handleStatusChange(quote.id, 'REJECTED') },
                    ]
                }
            ]}
        >
            <Box paddingBlockEnd="800">
                <Layout>
                    <Layout.Section>
                        <BlockStack gap="400">
                            {(draftError || acceptError || mgmtError || rejectError) && (
                                <Banner tone="critical" onDismiss={clearStatus}>{draftError || acceptError || mgmtError || rejectError}</Banner>
                            )}
                            {(draftSuccess || acceptSuccess || mgmtSuccess || rejectSuccess) && (
                                <Banner tone="success" onDismiss={clearStatus}>{draftSuccess || acceptSuccess || mgmtSuccess || rejectSuccess}</Banner>
                            )}

                            <Card padding="600">
                                <BlockStack gap="600">
                                    <QuoteProductDetails
                                        productTitle={quote.productTitle}
                                        variantTitle={quote.variantTitle || null}
                                        quantity={quote.quantity}
                                        featuredImage={quote.productDetails?.featuredImage || null}
                                    />
                                    <Divider />
                                    <QuoteMessage message={quote.customerMessage || null} />

                                    {((quote.customData && Object.keys(quote.customData).length > 0) || (quote.customImages && quote.customImages.length > 0)) && (
                                        <Box paddingBlockStart="200">
                                            <BlockStack gap="600">
                                                <Divider />
                                                <BlockStack gap="400">
                                                    <Text as="h2" variant="headingMd" fontWeight="semibold">Requested Services & Assets</Text>
                                                    <QuoteCustomDataDetails customData={quote.customData} />
                                                    <QuoteImages images={quote.customImages} />
                                                </BlockStack>
                                            </BlockStack>
                                        </Box>
                                    )}

                                    {quote.productDetails && (
                                        <Box paddingBlockStart="200">
                                            <BlockStack gap="400">
                                                <Divider />
                                                <QuoteFullProductDetails productDetails={quote.productDetails} />
                                            </BlockStack>
                                        </Box>
                                    )}
                                </BlockStack>
                            </Card>
                        </BlockStack>
                    </Layout.Section>

                    <Layout.Section variant="oneThird">
                        <BlockStack gap="500">
                            <QuoteDraftOrderInfo
                                draftOrderId={quote.draftOrderId}
                                draftOrderUrl={currentDraftOrderUrl || quote.draftOrderUrl}
                            />

                            <Card padding="500">
                                <BlockStack gap="600">
                                    <QuoteCustomerDetails firstName={quote.firstName} lastName={quote.lastName} email={quote.email} phone={quote.phone} />
                                    <Divider />
                                    <QuoteAddressDetails
                                        address1={quote.address1} address2={quote.address2} city={quote.city}
                                        district={quote.district} state={quote.state} pincode={quote.pincode}
                                        country={quote.country}
                                    />
                                    <Divider />
                                    <QuoteWhatsAppContact
                                        phone={quote.phone} firstName={quote.firstName} productTitle={quote.productTitle}
                                        quantity={quote.quantity} shop={quote.shop}
                                    />
                                </BlockStack>
                            </Card>

                            <QuoteSystemInfo status={quote.status} createdAt={quote.createdAt} />
                        </BlockStack>
                    </Layout.Section>
                </Layout>
            </Box>

            <QuoteAcceptModal
                open={isAcceptModalOpen}
                onClose={closeAcceptModal}
                quote={quote}
                price={price}
                setPrice={setPrice}
                quantity={quantity}
                setQuantity={setQuantity}
                currency={currency}
                setCurrency={setCurrency}
                message={acceptMessage}
                setMessage={setAcceptMessage}
                handleAccept={handleAccept}
                formatCurrency={formatCurrency}
                isPending={isAcceptPending}
            />

            <QuoteRejectModal
                open={isRejectModalOpen}
                onClose={closeRejectModal}
                selectedReason={selectedReason}
                setSelectedReason={setSelectedReason}
                customMessage={rejectCustomMessage}
                setCustomMessage={setRejectCustomMessage}
                handleReject={handleReject}
                isPending={isRejectPending}
                rejectionReasons={REJECTION_REASONS}
            />

            <QuoteDeleteModal
                open={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={() => { handleDelete(quote.id); setIsDeleteModalOpen(false); }}
                isPending={isDeleting}
            />
        </Page>
    );
};
