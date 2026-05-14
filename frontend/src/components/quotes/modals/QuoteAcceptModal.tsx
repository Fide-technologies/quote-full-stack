import React from 'react';
import {
    Modal,
    BlockStack,
    Banner,
    Select,
    TextField,
    Box,
    Text,
    Divider,
    InlineStack
} from '@shopify/polaris';
import type { Quote } from '@/api/quotes';

interface QuoteAcceptModalProps {
    open: boolean;
    onClose: () => void;
    quote: Quote;
    price: string;
    setPrice: (price: string) => void;
    quantity: number;
    setQuantity: (quantity: number) => void;
    currency: string;
    setCurrency: (currency: string) => void;
    message: string;
    setMessage: (message: string) => void;
    handleAccept: () => void;
    formatCurrency: (amount: number, currency: string) => string;
    isPending: boolean;
}

export const QuoteAcceptModal: React.FC<QuoteAcceptModalProps> = ({
    open,
    onClose,
    quote,
    price,
    setPrice,
    quantity,
    setQuantity,
    currency,
    setCurrency,
    message,
    setMessage,
    handleAccept,
    formatCurrency,
    isPending,
}) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Accept Quote & Notify Customer"
            primaryAction={{
                content: 'Confirm & Send Email',
                onAction: handleAccept,
                loading: isPending,
            }}
            secondaryActions={[
                {
                    content: 'Cancel',
                    onAction: onClose,
                },
            ]}
        >
            <Modal.Section>
                <BlockStack gap="500">
                    <Banner tone="info">
                        <p>
                            Confirm the final price and quantity. This will update the quote to <strong>APPROVED</strong> and send an email to <strong>{quote.email}</strong>.
                        </p>
                    </Banner>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', alignItems: 'end' }}>
                        <Select
                            label="Currency"
                            options={[
                                { label: 'USD ($)', value: 'USD' },
                                { label: 'EUR (€)', value: 'EUR' },
                                { label: 'GBP (£)', value: 'GBP' },
                                { label: 'INR (₹)', value: 'INR' },
                                { label: 'JPY (¥)', value: 'JPY' },
                            ]}
                            value={currency}
                            onChange={setCurrency}
                        />
                        <TextField
                            label="Unit Price"
                            type="number"
                            value={price}
                            onChange={setPrice}
                            prefix={currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'INR' ? '₹' : undefined}
                            autoComplete="off"
                        />
                        <TextField
                            label="Quantity"
                            type="number"
                            value={quantity.toString()}
                            onChange={(val) => setQuantity(Number(val))}
                            autoComplete="off"
                        />
                    </div>

                    <Box padding="400" background="bg-surface-secondary" borderRadius="200" borderWidth="025" borderColor="border">
                        <BlockStack gap="200">
                            <Text variant="headingSm" as="h3">Calculation Summary</Text>
                            <Divider />
                            <InlineStack align="space-between">
                                <Text as="span" tone="subdued">Unit Price:</Text>
                                <Text as="span" fontWeight="medium">{formatCurrency(Number(price), currency)}</Text>
                            </InlineStack>
                            <InlineStack align="space-between">
                                <Text as="span" tone="subdued">Quantity:</Text>
                                <Text as="span" fontWeight="medium">x {quantity}</Text>
                            </InlineStack>
                            <Divider />
                            <InlineStack align="space-between">
                                <Text as="span" variant="bodyMd" fontWeight="bold">Total Amount:</Text>
                                <Text as="span" variant="bodyMd" fontWeight="bold" tone="success">
                                    {formatCurrency(Number(price) * quantity, currency)}
                                </Text>
                            </InlineStack>
                        </BlockStack>
                    </Box>

                    <TextField
                        label="Email Message Preview"
                        value={message}
                        onChange={setMessage}
                        multiline={10}
                        autoComplete="off"
                        helpText="The amounts above are automatically synced with this message."
                    />
                </BlockStack>
            </Modal.Section>
        </Modal>
    );
};
