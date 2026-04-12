import React, { useState } from 'react';
import { Card, BlockStack, Text, Checkbox, TextField } from '@shopify/polaris';

import type { SettingsComponentProps } from '../../types/settings_components';

export const PricingSettings: React.FC<SettingsComponentProps> = ({ settings, onChange }) => {
  // Local state for free typing
  const [tagsInput, setTagsInput] = useState(settings.hidePriceByTags.join(", "));
  const [collectionsInput, setCollectionsInput] = useState(settings.hidePriceByCollections.join(", "));

  // State-in-render pattern to sync with props without causing extra effect cycles
  const [prevTags, setPrevTags] = useState(settings.hidePriceByTags);
  const [prevCollections, setPrevCollections] = useState(settings.hidePriceByCollections);

  if (settings.hidePriceByTags !== prevTags) {
    setTagsInput(settings.hidePriceByTags.join(", "));
    setPrevTags(settings.hidePriceByTags);
  }

  if (settings.hidePriceByCollections !== prevCollections) {
    setCollectionsInput(settings.hidePriceByCollections.join(", "));
    setPrevCollections(settings.hidePriceByCollections);
  }

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
