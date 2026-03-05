import { Modal, Box, Banner, Text, BlockStack } from "@shopify/polaris";
import { LockIcon } from "@shopify/polaris-icons";
import { type Quote } from "@/api/quotes";
import { useQuoteDraftOrder } from "@/hooks/useQuoteDraftOrder";
import { generateWhatsAppUrl } from "@/utils/whatsapp";
import { QuoteCustomerDetails } from "./details/QuoteCustomerDetails";
import { QuoteAddressDetails } from "./details/QuoteAddressDetails";
import { QuoteProductDetails } from "./details/QuoteProductDetails";
import { QuoteMessage } from "./details/QuoteMessage";
import { QuoteDraftOrderInfo } from "./details/QuoteDraftOrderInfo";
import { QuoteSystemInfo } from "./details/QuoteSystemInfo";
import { QuoteCustomDataDetails } from "./details/QuoteCustomDataDetails";
import { QuoteImages } from "./details/QuoteImages";

interface QuoteDetailsModalProps {
    quote: Quote | null;
    isOpen: boolean;
    onClose: () => void;
}

export function QuoteDetailsModal({ quote, isOpen, onClose }: QuoteDetailsModalProps) {
    const {
        handleCreateDraftOrder,
        isPending,
        isPro,
        isSettingsLoading,
        error,
        success,
        currentDraftOrderUrl,
        setError,
        setSuccess
    } = useQuoteDraftOrder({ quote });

    if (!quote) return null;

    const whatsappUrl = generateWhatsAppUrl(quote.phone, quote.firstName, quote.productTitle);

    // Define actions dynamically
    const primaryAction = currentDraftOrderUrl
        ? {
            content: 'View Invoice',
            onAction: () => window.open(currentDraftOrderUrl, '_blank'),
        }
        : {
            content: isSettingsLoading ? 'Loading...' : (isPro ? 'Create Draft Order' : 'Upgrade to Create Order'),
            onAction: isPro ? () => handleCreateDraftOrder() : () => { }, // Maybe redirect to billing?
            loading: isPending || isSettingsLoading,
            disabled: isPending || isSettingsLoading || !isPro,
            helpText: (!isPro && !isSettingsLoading) ? "Available on PRO plan" : undefined
        };

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            title={`Quote #${quote.id}`}
            primaryAction={primaryAction}
            secondaryActions={[
                {
                    content: 'Close',
                    onAction: onClose,
                }
            ]}
            size="large"
        >
            <Modal.Section>
                {error && (
                    <Box paddingBlockEnd="400">
                        <Banner tone="critical" onDismiss={() => setError(null)}>
                            {error}
                        </Banner>
                    </Box>
                )}
                {success && (
                    <Box paddingBlockEnd="400">
                        <Banner tone="success" onDismiss={() => setSuccess(null)}>
                            {success}
                        </Banner>
                    </Box>
                )}

                {!isPro && !currentDraftOrderUrl && !isSettingsLoading && (
                    <Box paddingBlockEnd="400">
                        <Banner tone="info" icon={LockIcon}>
                            <Text as="span">Draft Order creation is a <strong>PRO</strong> feature.</Text>
                        </Banner>
                    </Box>
                )}

                <BlockStack gap="400">
                    <QuoteCustomerDetails
                        firstName={quote.firstName}
                        lastName={quote.lastName}
                        email={quote.email}
                        phone={quote.phone || ''}
                        whatsappUrl={whatsappUrl}
                    />

                    <QuoteAddressDetails
                        address1={quote.address1}
                        address2={quote.address2 || null}
                        city={quote.city}
                        district={quote.district}
                        state={quote.state}
                        pincode={quote.pincode}
                    />

                    <QuoteProductDetails
                        productTitle={quote.productTitle}
                        variantTitle={quote.variantTitle || null}
                        quantity={quote.quantity}
                        featuredImage={quote.productDetails?.featuredImage || null}
                    />

                    <QuoteMessage message={quote.customerMessage || null} />

                    <QuoteCustomDataDetails customData={quote.customData} />
                    <QuoteImages images={quote.customImages} />

                    <QuoteDraftOrderInfo
                        draftOrderId={quote.draftOrderId || null}
                        draftOrderUrl={currentDraftOrderUrl}
                    />

                    <QuoteSystemInfo
                        status={quote.status}
                        createdAt={quote.createdAt}
                    />
                </BlockStack>
            </Modal.Section>
        </Modal>
    );
}
