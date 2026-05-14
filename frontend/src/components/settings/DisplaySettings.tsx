import React from 'react';
import { Card, BlockStack, Text, Checkbox, Select, Banner } from '@shopify/polaris';
import type { ISettings } from '../../types/settings';

interface Props {
  settings: ISettings;
  onChange: (key: keyof ISettings, value: unknown) => void;
}

export const DisplaySettings: React.FC<Props> = ({ settings, onChange }) => {
  const formOptions = [
    { label: 'Popup / Slide-out Form', value: 'popup' },
    { label: 'Inline Form (after description)', value: 'inline' },
  ];

  return (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">Platform Display Rules</Text>
          <Checkbox
            label="Show on Product Page"
            checked={settings.showOnProductPage}
            onChange={(v) => onChange('showOnProductPage', v)}
          />
          <Checkbox
            label="Show on Collection Listing"
            checked={settings.showOnCollectionPage}
            onChange={(v) => onChange('showOnCollectionPage', v)}
          />
          <Checkbox
            label="Show on Home Page sections"
            checked={settings.showOnHomePage}
            onChange={(v) => onChange('showOnHomePage', v)}
          />
          <Checkbox
            label="Show on Cart page"
            checked={settings.showOnCartPage}
            onChange={(v) => onChange('showOnCartPage', v)}
          />
        </BlockStack>
      </Card>
      
      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">UI Preference</Text>
          <Select
            label="Form Presentation style"
            options={formOptions}
            value={settings.formType}
            onChange={(v) => onChange('formType', v)}
          />
          <Checkbox
            label="Completely replace price with button"
            checked={settings.replacePrice}
            onChange={(v) => onChange('replacePrice', v)}
            helpText="Shows only the button instead of both price and button."
          />
        </BlockStack>
      </Card>

      <Banner tone="warning" title="App Embed Required">
        <p>Ensure the <b>App Embed</b> is enabled in your theme editor for these display settings to take effect.</p>
      </Banner>
    </BlockStack>
  );
};
