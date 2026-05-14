import { BlockStack, Card, Checkbox, Text, TextField } from '@shopify/polaris';
import type React from 'react';
import type { IEmailSettings } from '../../api/email-settings';
import { SMTPSettings } from './SMTPSettings';

interface Props {
  settings: IEmailSettings;
  onChange: (key: keyof IEmailSettings, value: unknown) => void;
}

export const NotificationSettings: React.FC<Props> = ({ settings, onChange }) => {
  return (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">
            Internal Alerts
          </Text>
          <Checkbox
            label="Admin email notifications"
            checked={settings.adminEmailEnabled}
            onChange={(v) => onChange('adminEmailEnabled', v)}
            helpText="Get notified whenever a new quote is submitted."
          />
          {settings.adminEmailEnabled && (
            <TextField
              label="Recipient email(s)"
              value={settings.adminEmail}
              onChange={(v) => onChange('adminEmail', v)}
              autoComplete="email"
              type="email"
              placeholder="e.g. sales@yourstore.com"
            />
          )}
        </BlockStack>
      </Card>

      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">
            Customer Experience
          </Text>
          <Checkbox
            label="Send confirmation email to customer"
            checked={settings.customerEmailEnabled}
            onChange={(v) => onChange('customerEmailEnabled', v)}
          />
        </BlockStack>
      </Card>

      <SMTPSettings settings={settings} onChange={onChange} />
    </BlockStack>
  );
};
