import React from 'react';
import {
    Modal,
    BlockStack,
    Banner,
    ChoiceList,
    TextField,
    Box,
    Text
} from '@shopify/polaris';

interface RejectionReason {
    label: string;
    value: string;
    text: string;
}

interface QuoteRejectModalProps {
    open: boolean;
    onClose: () => void;
    selectedReason: string;
    setSelectedReason: (reason: string) => void;
    customMessage: string;
    setCustomMessage: (message: string) => void;
    handleReject: () => void;
    isPending: boolean;
    rejectionReasons: RejectionReason[];
}

export const QuoteRejectModal: React.FC<QuoteRejectModalProps> = ({
    open,
    onClose,
    selectedReason,
    setSelectedReason,
    customMessage,
    setCustomMessage,
    handleReject,
    isPending,
    rejectionReasons,
}) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Reject Quote Request"
            primaryAction={{
                content: 'Reject Quote',
                destructive: true,
                onAction: handleReject,
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
                <BlockStack gap="400">
                    <Banner tone="warning">
                        <p>This will send a rejection email to the customer and mark the quote as Rejected.</p>
                    </Banner>
                    
                    <ChoiceList
                        title="Rejection Reason"
                        choices={rejectionReasons.map(r => ({ label: r.label, value: r.value }))}
                        selected={[selectedReason]}
                        onChange={(value: string[]) => setSelectedReason(value[0])}
                    />

                    {selectedReason === 'OTHER' && (
                        <TextField
                            label="Custom Reason (Sent to customer)"
                            value={customMessage}
                            onChange={setCustomMessage}
                            multiline={4}
                            autoComplete="off"
                            placeholder="e.g. Unfortunately, we are currently out of stock for this item..."
                            helpText="A polite explanation helps maintain good customer relationships."
                        />
                    )}
                    
                    {selectedReason !== 'OTHER' && (
                        <Box padding="300" background="bg-surface-secondary" borderRadius="200" borderStyle="dashed" borderWidth="025" borderColor="border">
                            <BlockStack gap="100">
                                <Text as="p" variant="bodySm" fontWeight="bold" tone="subdued">
                                    Email Preview
                                </Text>
                                <Text as="p" variant="bodyMd" tone="subdued">
                                    "{rejectionReasons.find(r => r.value === selectedReason)?.text}"
                                </Text>
                            </BlockStack>
                        </Box>
                    )}
                </BlockStack>
            </Modal.Section>
        </Modal>
    );
};
