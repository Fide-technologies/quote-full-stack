import React from 'react';
import { Card, BlockStack, Text, Select, TextField, Banner } from '@shopify/polaris';
import type { ISettings } from '../../types/settings';

interface Props {
  settings: ISettings;
  onChange: (key: keyof ISettings, value: unknown) => void;
}

export const VisibilitySettings: React.FC<Props> = ({ settings, onChange }) => {
  const visibilityOptions = [
    { label: 'All users (Public)', value: 'all' },
    { label: 'Logged-in users only', value: 'logged_in' },
    { label: 'Specific customer tags', value: 'tags' },
    { label: 'B2B / Wholesale customers', value: 'b2b' },
  ];

  return (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">Access Control</Text>
          <Select
            label="Who can see the quote button?"
            options={visibilityOptions}
            value={settings.visibility}
            onChange={(v) => onChange('visibility', v)}
            helpText="Restrict access to quote requests for non-auth users."
          />
          {settings.visibility === 'tags' && (
            <TextField
                label="Required customer tags (comma separated)"
                value={settings.customerTags.join(", ")}
                onChange={(v) => onChange('customerTags', v.split(",").map(t => t.trim()).filter(Boolean))}
                autoComplete="off"
                placeholder="PRO, WHOLESALE"
            />
          )}
        </BlockStack>
      </Card>
      
      {settings.visibility === 'b2b' && (
        <Banner tone="info" title="B2B Visibility">
          <p>The quote option will only be displayed for customers linked to a Shopify B2B company.</p>
        </Banner>
      )}
    </BlockStack>
  );
};
