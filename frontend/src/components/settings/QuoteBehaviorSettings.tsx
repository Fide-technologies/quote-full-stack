import React from 'react';
import { Card, BlockStack, Text, Checkbox, TextField } from '@shopify/polaris';
import type { ISettings } from '../../types/settings';

interface Props {
  settings: ISettings;
  onChange: (key: keyof ISettings, value: any) => void;
}

export const QuoteBehaviorSettings: React.FC<Props> = ({ settings, onChange }) => {
  return (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">Submission Logic</Text>
          <Checkbox
            label="Allow customer to suggests prices"
            checked={settings.allowPriceSuggestion}
            onChange={(v) => onChange('allowPriceSuggestion', v)}
            helpText="Add a field where customers can propose their own value."
          />
          <Checkbox
            label="Allow multiple products in a single quote"
            checked={settings.allowMultipleProducts}
            onChange={(v) => onChange('allowMultipleProducts', v)}
          />
          <Checkbox
            label="Enable Cart-to-Quote converter"
            checked={settings.cartToQuote}
            onChange={(v) => onChange('cartToQuote', v)}
            helpText="Shows a 'Request Quote' buttoon on the cart page instead of checkout."
          />
          <TextField
              label="Redirect after quote submission"
              value={settings.redirectAfterSubmit}
              onChange={(v) => onChange('redirectAfterSubmit', v)}
              autoComplete="off"
              helpText="Specify a URL to redirect the customer to after they successfully request a quote."
              placeholder="e.g. /pages/thank-you"
          />
          <Checkbox
            label="Automatically create draft order (unstable)"
            checked={settings.autoCreateDraftOrder}
            onChange={(v) => onChange('autoCreateDraftOrder', v)}
            helpText="Recommended only for stores with fixed price policies."
          />
        </BlockStack>
      </Card>
    </BlockStack>
  );
};
