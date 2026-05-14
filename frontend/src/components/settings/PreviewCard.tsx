import React from 'react';
import { Card, BlockStack, Text, Box, InlineStack, Badge } from '@shopify/polaris';

import type { PreviewCardProps } from '../../types/settings_components';

export const PreviewCard: React.FC<PreviewCardProps> = ({ settings }) => {
  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between">
          <Text variant="headingMd" as="h2">Preview</Text>
          <Badge tone="info">Live Preview</Badge>
        </InlineStack>
        
        <Box 
          padding="400" 
          background="bg-surface-secondary" 
          borderRadius="200"
          borderWidth="025"
          borderColor="border"
        >
          <BlockStack gap="400">
            {/* Fake Product Image */}
            <div style={{
                width: '100%',
                aspectRatio: '1/1',
                background: '#f0f0f0',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}>
                <img 
                    src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=300&h=300" // Mock image
                    alt="Product preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </div>

            <BlockStack gap="300">
                <Text variant="headingXl" as="h3">Example Product</Text>
                {!settings.hidePriceGlobal && (
                    <Text variant="headingLg" fontWeight="bold" as="p" tone="subdued">$1,725.00</Text>
                )}
                
                <BlockStack gap="300">
                    {/* Position: Above (Injected) */}
                    {settings.placementLocation === 'above' && settings.appEnabled && (
                        <div style={{
                            width: '100%',
                            padding: '14px 20px',
                            backgroundColor: settings.buttonColor || "#008060",
                            color: settings.buttonTextColor || "#FFFFFF",
                            textAlign: 'center',
                            borderRadius: '8px',
                            fontWeight: '700',
                            fontSize: '16px',
                            cursor: 'default',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            transition: 'all 0.2s ease'
                        }}>
                             {settings.buttonText || 'Request Quote'}
                        </div>
                    )}
                    
                    {!settings.hideAddToCart && (
                         <div style={{
                            width: '100%',
                            padding: '14px 20px',
                            backgroundColor: '#FFFFFF',
                            color: '#1a1a1a',
                            textAlign: 'center',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '15px',
                            border: '1px solid #d1d1d1',
                            cursor: 'default'
                         }}>Add to cart</div>
                    )}
 
                    {!settings.hideBuyNow && (
                         <div style={{
                            width: '100%',
                            padding: '14px 20px',
                            backgroundColor: '#1a1a1a',
                            color: '#FFFFFF',
                            textAlign: 'center',
                            borderRadius: '8px',
                            fontWeight: '700',
                            fontSize: '16px',
                            cursor: 'default'
                         }}>Buy it now</div>
                    )}
 
                    {/* Position: Below (Injected) */}
                    {(settings.placementLocation === 'below' || !settings.placementLocation) && settings.appEnabled && (
                        <div style={{
                            width: '100%',
                            padding: '14px 20px',
                            backgroundColor: settings.buttonColor || "#008060",
                            color: settings.buttonTextColor || "#FFFFFF",
                            textAlign: 'center',
                            borderRadius: '8px',
                            fontWeight: '700',
                            fontSize: '16px',
                            cursor: 'default',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            transition: 'all 0.2s ease'
                        }}>
                             {settings.buttonText || 'Request Quote'}
                        </div>
                    )}
                </BlockStack>
            </BlockStack>
          </BlockStack>
        </Box>
        
        <Text as="p" variant="bodySm" tone="subdued" alignment="center">
            This is a mock representation of how your storefront will appear according to your current configuration.
        </Text>
      </BlockStack>
    </Card>
  );
};
