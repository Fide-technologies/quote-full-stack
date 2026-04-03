import { BlockStack, Text, Box, Card, InlineStack, Button } from '@shopify/polaris';
import { ExportIcon } from '@shopify/polaris-icons';
import { QuoteImageModal } from './QuoteImageModal';
import { downloadAllImages } from '@/utils/download';
import { useState } from 'react';

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
            <Card>
                <BlockStack gap="200">
                    <InlineStack align="space-between" blockAlign="center">
                        <Text variant="headingSm" as="h3">Custom Images</Text>
                        <Button
                            variant="plain"
                            icon={ExportIcon}
                            onClick={handleDownloadAll}
                        >
                            Download All
                        </Button>
                    </InlineStack>
                    <InlineStack gap="300" wrap={true}>
                        {images.map((url, index) => (
                            <Box
                                key={index}
                                borderRadius="200"
                                overflowX="hidden"
                                overflowY="hidden"
                                borderWidth="025"
                                borderColor="border"
                                shadow="100"
                            >
                                <div
                                    style={{
                                        width: '100px',
                                        height: '100px',
                                        transition: 'transform 0.2s ease',
                                        cursor: 'zoom-in'
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
                    </InlineStack>
                </BlockStack>
            </Card>

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
