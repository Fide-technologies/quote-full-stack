import React from 'react';
import { BlockStack, Text, Box, Card, InlineStack } from '@shopify/polaris';

interface QuoteImagesProps {
    images?: string[] | null;
}

export const QuoteImages: React.FC<QuoteImagesProps> = ({ images }) => {
    if (!images || images.length === 0) return null;

    return (
        <Card>
            <BlockStack gap="200">
                <Text variant="headingSm" as="h3">Custom Images</Text>
                <InlineStack gap="300" wrap={true}>
                    {images.map((url, index) => (
                        <Box
                            key={index}
                            borderRadius="200"
                            overflowX="hidden"
                            overflowY="hidden"
                            borderWidth="025"
                            borderColor="border"
                        >
                            <div style={{ width: '100px', height: '100px' }}>
                                <img
                                    src={url}
                                    alt={`Custom upload ${index + 1}`}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => window.open(url, '_blank')}
                                />
                            </div>
                        </Box>
                    ))}
                </InlineStack>
            </BlockStack>
        </Card>
    );
};
