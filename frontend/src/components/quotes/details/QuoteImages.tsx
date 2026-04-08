import { BlockStack, Text, Box, InlineStack, Button } from '@shopify/polaris';
import { ExportIcon } from '@shopify/polaris-icons';
import { QuoteImageModal } from './QuoteImageModal';
import { downloadAllImages } from '@/utils/download';
import React, { useState } from 'react';

interface QuoteImagesProps {
    images?: string[] | null;
}

export const QuoteImages: React.FC<QuoteImagesProps> = ({ images }) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    if (!images || images.length === 0) return null;

    const handleDownloadAll = () => {
        downloadAllImages(images);
    };

    return (
        <>
            <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                    <Text variant="headingSm" as="h3" fontWeight="semibold" tone="subdued">Custom Asset Uploads</Text>
                    <Button
                        variant="plain"
                        icon={ExportIcon}
                        onClick={handleDownloadAll}
                    >
                        Download ZIP
                    </Button>
                </InlineStack>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                    gap: '12px'
                }}>
                    {images.map((url, index) => (
                        <Box
                            key={index}
                            borderRadius="200"
                            overflowX="hidden"
                            overflowY="hidden"
                            borderWidth="025"
                            borderColor="border"
                        >
                            <div
                                style={{
                                    aspectRatio: '1/1',
                                    transition: 'transform 0.2s ease',
                                    cursor: 'zoom-in',
                                    backgroundColor: 'var(--p-color-bg-surface-secondary)'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                onClick={() => setSelectedImage(url)}
                            >
                                <img
                                    src={url}
                                    alt={`Custom upload ${index + 1}`}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            </div>
                        </Box>
                    ))}
                </div>
            </BlockStack>

            {selectedImage && (
                <QuoteImageModal
                    open={!!selectedImage}
                    onClose={() => setSelectedImage(null)}
                    imageUrl={selectedImage}
                />
            )}
        </>
    );
};
