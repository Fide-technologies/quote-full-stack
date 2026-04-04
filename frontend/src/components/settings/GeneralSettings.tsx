import { Card, BlockStack, Text, Checkbox, TextField } from '@shopify/polaris';
import type { ISettings } from '../../types/settings';

interface Props {
  settings: ISettings;
  onChange: (key: keyof ISettings, value: any) => void;
}

export const GeneralSettings: React.FC<Props> = ({ settings, onChange }) => {
  return (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">General Configuration</Text>
          <Checkbox
            label="Enable App Status"
            checked={settings.appEnabled}
            onChange={(checked) => onChange('appEnabled', checked)}
            helpText="Toggle the entire quote functionality on your store."
          />
        </BlockStack>
      </Card>
      
      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">Store Information</Text>
          <TextField
              label="Store Name (Internal Reference)"
              value={settings.storeName || ""} 
              onChange={(v) => onChange('storeName' as any, v)}
              autoComplete="off"
          />
        </BlockStack>
      </Card>
    </BlockStack>
  );
};
