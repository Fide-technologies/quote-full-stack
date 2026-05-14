import React, { useState } from 'react';
import { Modal, Box, BlockStack, InlineStack, Button, Text } from '@shopify/polaris';
import { MaximizeIcon, MinimizeIcon, SearchIcon, ArrowDownIcon } from '@shopify/polaris-icons';
import { downloadImage } from '../../../utils/download';

interface QuoteImageModalProps {
    open: boolean;
    onClose: () => void;
    imageUrl: string;
}

type ImageSize = 'small' | 'medium' | 'large';

const sizeMap: Record<ImageSize, string> = {
    small: '400px',
    medium: '650px',
    large: '950px',
};

export const QuoteImageModal: React.FC<QuoteImageModalProps> = ({ open, onClose, imageUrl }) => {
    const [size, setSize] = useState<ImageSize>('medium');

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Image Preview"
            size={size === 'large' ? 'large' : size === 'small' ? 'small' : undefined}
            primaryAction={{
                content: 'Download Image',
                onAction: () => downloadImage(imageUrl),
                icon: ArrowDownIcon
            }}
        >
            <Modal.Section>
                <BlockStack gap="400">
                    <InlineStack align="center" gap="200">
                        <Button
                            pressed={size === 'small'}
                            onClick={() => setSize('small')}
                            icon={MinimizeIcon}
                            size="slim"
                        >
                            Small
                        </Button>
                        <Button
                            pressed={size === 'medium'}
                            onClick={() => setSize('medium')}
                            icon={SearchIcon}
                            size="slim"
                        >
                            Mid
                        </Button>
                        <Button
                            pressed={size === 'large'}
                            onClick={() => setSize('large')}
                            icon={MaximizeIcon}
                            size="slim"
                        >
                            Large
                        </Button>
                    </InlineStack>

                    <Box
                        padding="400"
                        background="bg-surface-secondary"
                        borderRadius="200"
                        minHeight="300px"
                    >
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '100%',
                            transition: 'all 0.3s ease-in-out'
                        }}>
                            <img
                                src={imageUrl}
                                alt="Quote attachment preview"
                                style={{
                                    maxWidth: '100%',
                                    width: sizeMap[size],
                                    height: 'auto',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    objectFit: 'contain'
                                }}
                            />
                        </div>
                    </Box>

                    <InlineStack align="center">
                        <Text variant="bodySm" as="p" tone="subdued">
                            Previewing high-resolution attachment
                        </Text>
                    </InlineStack>
                </BlockStack>
            </Modal.Section>
        </Modal>
    );
};
