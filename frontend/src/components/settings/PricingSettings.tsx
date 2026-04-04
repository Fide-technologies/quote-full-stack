import React from 'react';
import { Card, BlockStack, Text, Checkbox, TextField } from '@shopify/polaris';
import type { ISettings } from '../../types/settings';

interface Props {
  settings: ISettings;
  onChange: (key: keyof ISettings, value: any) => void;
}

export const PricingSettings: React.FC<Props> = ({ settings, onChange }) => {
  return (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">Price Visibility</Text>
          <Checkbox
            label="Hide prices globally"
            checked={settings.hidePriceGlobal}
            onChange={(v) => onChange('hidePriceGlobal', v)}
            helpText="Completely hide prices from the storefront."
          />
          <Checkbox
            label="Require login to see prices"
            checked={settings.loginToSeePrice}
            onChange={(v) => onChange('loginToSeePrice', v)}
            helpText="Prompt customers to log in before displaying product prices."
          />
        </BlockStack>
      </Card>

      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">Hide Pricing Rules</Text>
          <TextField
            label="Hide pricing by Product Tags (comma separated)"
            value={settings.hidePriceByTags.join(", ")}
            onChange={(v) => onChange('hidePriceByTags', v.split(",").map(t => t.trim()).filter(Boolean))}
            autoComplete="off"
            helpText="e.g. VIP, Wholesale"
          />
          <TextField
            label="Hide pricing by Collection Handles (comma separated)"
            value={settings.hidePriceByCollections.join(", ")}
            onChange={(v) => onChange('hidePriceByCollections', v.split(",").map(t => t.trim()).filter(Boolean))}
            autoComplete="off"
            helpText="e.g. wholesale-only, luxury-items"
          />
        </BlockStack>
      </Card>
    </BlockStack>
  );
};
