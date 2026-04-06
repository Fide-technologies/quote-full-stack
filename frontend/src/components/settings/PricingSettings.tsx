import React, { useState, useEffect } from 'react';
import { Card, BlockStack, Text, Checkbox, TextField } from '@shopify/polaris';
import type { ISettings } from '../../types/settings';

interface Props {
  settings: ISettings;
  onChange: (key: keyof ISettings, value: unknown) => void;
}

export const PricingSettings: React.FC<Props> = ({ settings, onChange }) => {
  // Local state for free typing
  const [tagsInput, setTagsInput] = useState(settings.hidePriceByTags.join(", "));
  const [collectionsInput, setCollectionsInput] = useState(settings.hidePriceByCollections.join(", "));

  // Initialize and sync only if external settings change (e.g. on mount or server refresh)
  useEffect(() => {
    const newVal = settings.hidePriceByTags.join(", ");
    // Only update if the meaningful content is different to avoid interrupting typing
    if (newVal !== tagsInput.split(",").map(t => t.trim()).filter(Boolean).join(", ")) {
        setTagsInput(newVal);
    }
  }, [settings.hidePriceByTags]);

  useEffect(() => {
    const newVal = settings.hidePriceByCollections.join(", ");
    if (newVal !== collectionsInput.split(",").map(t => t.trim()).filter(Boolean).join(", ")) {
        setCollectionsInput(newVal);
    }
  }, [settings.hidePriceByCollections]);

  // Sync to parent settings only on blur (when the user finishes typing)
  const handleTagsBlur = () => {
    const tagsArray = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
    onChange('hidePriceByTags', tagsArray);
  };

  const handleCollectionsBlur = () => {
    const collectionsArray = collectionsInput.split(",").map(t => t.trim()).filter(Boolean);
    onChange('hidePriceByCollections', collectionsArray);
  };

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
            value={tagsInput}
            onChange={setTagsInput}
            onBlur={handleTagsBlur}
            autoComplete="off"
            helpText="e.g. VIP, Wholesale"
          />
          <TextField
            label="Hide pricing by Collection Handles (comma separated)"
            value={collectionsInput}
            onChange={setCollectionsInput}
            onBlur={handleCollectionsBlur}
            autoComplete="off"
            helpText="e.g. wholesale-only, luxury-items"
          />
        </BlockStack>
      </Card>
    </BlockStack>
  );
};
