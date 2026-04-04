import React from 'react';
import { BlockStack, Text, Checkbox, Select, RadioButton, Box, Button, TextField } from '@shopify/polaris';
import { useAppBridge } from '@shopify/app-bridge-react';
import type { ISettings } from '../../types/settings';

interface Props {
  settings: ISettings;
  onChange: (key: keyof ISettings, value: unknown) => void;
}

export const QuoteButtonSettings: React.FC<Props> = ({ settings, onChange }) => {
  const shopify = useAppBridge();

  const handleSelectProducts = async () => {
    const selectedProducts = settings.selectedProducts || [];
    const selected = await shopify.resourcePicker({
        type: 'product',
        multiple: true,
        action: 'select',
        selectionIds: selectedProducts.map((id: string) => ({ id }))
    });
    if (selected) {
        onChange('selectedProducts', selected.map((p: { id: string }) => p.id));
    }
  };

  const handleSelectCollections = async () => {
    const selectedCollections = settings.selectedCollections || [];
    const selected = await shopify.resourcePicker({
        type: 'collection',
        multiple: true,
        action: 'select',
        selectionIds: selectedCollections.map((id: string) => ({ id }))
    });
    if (selected) {
        onChange('selectedCollections', selected.map((c: { id: string }) => c.id));
    }
  };

  return (
    <BlockStack gap="400">
      {/* Appearance Section */}
      <BlockStack gap="200">
        <Text as="h3" variant="headingSm" fontWeight="semibold">Appearance</Text>
        <TextField 
            label="Button text"
            value={settings.buttonText || "Request Quote"}
            onChange={(v) => onChange('buttonText', v)}
            autoComplete="off"
            placeholder="e.g. Request Quote"
        />
        
        <Box paddingBlockStart="200">
            <BlockStack gap="200">
                <Text as="p" variant="bodyMd">Button color</Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input 
                        type="color" 
                        value={settings.buttonColor || "#008060"} 
                        onChange={(e) => onChange('buttonColor', e.target.value)}
                        style={{ width: '40px', height: '40px', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '0' }}
                    />
                    <code style={{ background: '#f4f6f8', padding: '4px 8px', borderRadius: '4px' }}>{settings.buttonColor || "#008060"}</code>
                </div>
            </BlockStack>
        </Box>

        <Box paddingBlockStart="200">
            <BlockStack gap="200">
                <Text as="p" variant="bodyMd">Button text color</Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input 
                        type="color" 
                        value={settings.buttonTextColor || "#FFFFFF"} 
                        onChange={(e) => onChange('buttonTextColor', e.target.value)}
                        style={{ width: '40px', height: '40px', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '0' }}
                    />
                    <code style={{ background: '#f4f6f8', padding: '4px 8px', borderRadius: '4px' }}>{settings.buttonTextColor || "#FFFFFF"}</code>
                </div>
            </BlockStack>
        </Box>
      </BlockStack>

      <hr style={{ border: 'none', borderTop: '1px solid #dfe3e8', margin: '8px 0' }} />

      {/* Storefront Integration Section */}
      <BlockStack gap="200">
        <Text as="h3" variant="headingSm" fontWeight="semibold">Storefront Integration</Text>
        <Checkbox
          label="Hide 'Add to Cart' button"
          checked={!!settings.hideAddToCart}
          onChange={(v) => onChange('hideAddToCart', v)}
        />
        <Checkbox
          label="Hide 'Buy It Now' / Dynamic Checkout buttons"
          checked={!!settings.hideBuyNow}
          onChange={(v) => onChange('hideBuyNow', v)}
          helpText="This will hide the secondary checkout buttons like PayPal or Apple Pay if present."
        />
      </BlockStack>

      <hr style={{ border: 'none', borderTop: '1px solid #dfe3e8', margin: '8px 0' }} />

      {/* Position Section */}
      <BlockStack gap="400">
        <BlockStack gap="200">
            <Text as="h3" variant="headingSm" fontWeight="semibold">Display button on what position?</Text>
            <Checkbox
            label="Product page"
            checked={!!settings.showOnProductPage}
            onChange={(v) => onChange('showOnProductPage', v)}
            />
            <Checkbox
            label="Catalog/collection page"
            checked={!!settings.showOnCollectionPage}
            onChange={(v) => onChange('showOnCollectionPage', v)}
            />
            <Checkbox
            label="Cart page"
            checked={!!settings.showOnCartPage}
            onChange={(v) => onChange('showOnCartPage', v)}
            />
        </BlockStack>

        <BlockStack gap="200">
            <Text as="h3" variant="bodyMd" fontWeight="semibold">Button Placement</Text>
            <Select
                label="Placement relative to Cart buttons"
                options={[
                    { label: "Above 'Add To Cart'", value: 'above' },
                    { label: "Below 'Add To Cart'", value: 'below' },
                ]}
                value={settings.placementLocation || 'above'}
                onChange={(v) => onChange('placementLocation', v)}
            />
            <Text as="p" variant="bodySm" tone="subdued">Choose where the Quote button should appear relative to your theme's native buttons.</Text>
        </BlockStack>

        <BlockStack gap="200">
            <Text as="h3" variant="bodyMd" fontWeight="semibold">Advanced Position (Fallback)</Text>
            <Select
                label="If theme placement fails, use:"
                options={[
                    { label: "Under Button 'Add To Cart'", value: 'under-cart' },
                    { label: "Above Price", value: 'above-price' },
                    { label: "Instead of Add To Cart", value: 'instead-cart' },
                ]}
                value={settings.buttonPosition || 'under-cart'}
                onChange={(v) => onChange('buttonPosition', v)}
            />
            <Text as="p" variant="bodySm" tone="subdued">Available with starter plan.</Text>
        </BlockStack>
      </BlockStack>

      {/* Filter Section */}
      <BlockStack gap="200">
        <Text as="h3" variant="headingSm" fontWeight="semibold">Display button for what products?</Text>
        <RadioButton
            label="All products"
            checked={(settings.displayCondition || 'all') === 'all'}
            onChange={() => onChange('displayCondition', 'all')}
        />
        
        <RadioButton
            label="Selected products"
            checked={settings.displayCondition === 'products'}
            onChange={() => onChange('displayCondition', 'products')}
        />
        {settings.displayCondition === 'products' && (
            <Box paddingInlineStart="600">
                 <BlockStack gap="200">
                    <Button onClick={handleSelectProducts}>
                        {(settings.selectedProducts || []).length > 0 ? `Selected ${settings.selectedProducts?.length} products` : "Browse products"}
                    </Button>
                    <Text as="p" variant="bodySm" tone="subdued">The quote button will only appear on these items.</Text>
                 </BlockStack>
            </Box>
        )}

        <RadioButton
            label="Selected collections"
            checked={settings.displayCondition === 'collections'}
            onChange={() => onChange('displayCondition', 'collections')}
        />
        {settings.displayCondition === 'collections' && (
            <Box paddingInlineStart="600">
                 <BlockStack gap="200">
                    <Button onClick={handleSelectCollections}>
                         {(settings.selectedCollections || []).length > 0 ? `Selected ${settings.selectedCollections?.length} collections` : "Browse collections"}
                    </Button>
                    <Text as="p" variant="bodySm" tone="subdued">The quote button will only appear on products within these collections.</Text>
                 </BlockStack>
            </Box>
        )}

        <RadioButton
            label="Custom condition"
            checked={settings.displayCondition === 'custom'}
            onChange={() => onChange('displayCondition', 'custom')}
        />
        {settings.displayCondition === 'custom' && (
            <Box paddingInlineStart="600">
                 <BlockStack gap="200">
                    <TextField 
                        label="Product tags"
                        value={(settings.productTags || []).join(', ')}
                        onChange={(v) => onChange('productTags', v.split(',').map(t => t.trim()))}
                        helpText="Separate tags with commas. Quote button shows if product has ANY of these tags."
                        autoComplete="off"
                    />
                 </BlockStack>
            </Box>
        )}
        <Text as="p" variant="bodySm" tone="subdued">Available with starter plan.</Text>
      </BlockStack>

      {/* Visibility Section */}
      <BlockStack gap="200">
        <Text as="h3" variant="headingSm" fontWeight="semibold">Who will see this button?</Text>
        <RadioButton
            label="All customer"
            checked={(settings.visibility || 'all') === 'all'}
            onChange={() => onChange('visibility', 'all')}
        />
        <RadioButton
            label="Logged in customer"
            checked={settings.visibility === 'logged_in'}
            onChange={() => onChange('visibility', 'logged_in')}
        />
      </BlockStack>
    </BlockStack>
  );
};
