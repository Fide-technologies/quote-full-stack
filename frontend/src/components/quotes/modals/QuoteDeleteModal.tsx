import React from 'react';
import {
    Modal,
    BlockStack,
    Text
} from '@shopify/polaris';

interface QuoteDeleteModalProps {
    open: boolean;
    onClose: () => void;
    onDelete: () => void;
    isPending: boolean;
}

export const QuoteDeleteModal: React.FC<QuoteDeleteModalProps> = ({
    open,
    onClose,
    onDelete,
    isPending,
}) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Delete Quote Request"
            primaryAction={{
                content: 'Delete',
                destructive: true,
                onAction: onDelete,
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
                    <Text as="p">
                        Are you sure you want to delete this quote request? This action cannot be undone and all data associated with this request will be permanently removed.
                    </Text>
                </BlockStack>
            </Modal.Section>
        </Modal>
    );
};
