import {
  Banner,
  BlockStack,
  Button,
  Card,
  Checkbox,
  Collapsible,
  FormLayout,
  InlineStack,
  Select,
  Text,
  TextField,
} from '@shopify/polaris';
import { useQuery } from '@tanstack/react-query';
import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import {
  getSmtpProviders,
  type IEmailSettings,
  testSmtpConnection,
} from '../../api/email-settings';

interface SMTPSettingsProps {
  settings: IEmailSettings;
  onChange: (key: keyof IEmailSettings, value: unknown) => void;
}

const getAuthFieldsConfig = (provider: string) => {
  switch (provider) {
    case 'google':
    case 'outlook':
    case 'zoho':
      return {
        userLabel: 'Email Address',
        userHelpText: 'Your email address.',
        passLabel: 'App Password',
        passHelpText: 'Use an App Password if 2FA is enabled.',
      };
    case 'sendgrid':
      return {
        userLabel: "Username ('apikey')",
        userHelpText: "Always 'apikey' for SendGrid.",
        passLabel: 'API Key',
        passHelpText: 'Your SendGrid API Key (requires Mail Send permissions).',
      };
    case 'brevo':
      return {
        userLabel: 'SMTP Login',
        userHelpText: 'SMTP login from Brevo dashboard.',
        passLabel: 'SMTP Password',
        passHelpText: 'SMTP password from Brevo dashboard.',
      };
    case 'mailgun':
      return {
        userLabel: 'SMTP Login',
        userHelpText: 'SMTP credentials from Mailgun dashboard.',
        passLabel: 'SMTP Password',
        passHelpText: 'SMTP password from Mailgun dashboard.',
      };
    case 'ses':
      return {
        userLabel: 'SMTP Username',
        userHelpText: 'Amazon SES SMTP Username (separate from AWS keys).',
        passLabel: 'SMTP Password',
        passHelpText: 'Amazon SES SMTP Password.',
      };
    case 'elastic':
      return {
        userLabel: 'Email Address',
        userHelpText: 'Your Elastic Email address.',
        passLabel: 'API Key',
        passHelpText: 'Your Elastic Email API Key.',
      };
    case 'netcore':
      return {
        userLabel: 'Username',
        userHelpText: 'Your Pepipost username.',
        passLabel: 'API Key',
        passHelpText: 'Your Pepipost API Key.',
      };
    default:
      return {
        userLabel: 'SMTP Username',
        userHelpText: 'Usually your email address.',
        passLabel: 'SMTP Password',
        passHelpText: 'Your SMTP password or API key.',
      };
  }
};

export const SMTPSettings: React.FC<SMTPSettingsProps> = ({ settings, onChange }) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(settings.smtpProvider === 'custom');

  const { data: providers = [] } = useQuery({
    queryKey: ['smtp-providers'],
    queryFn: getSmtpProviders,
  });

  const providerOptions = useMemo(
    () => providers.map((p) => ({ label: p.label, value: p.value })),
    [providers],
  );

  const handleProviderChange = useCallback(
    (value: string) => {
      const provider = providers.find((p) => p.value === value);
      onChange('smtpProvider', value);
      setShowAdvanced(value === 'custom');
      if (provider) {
        onChange('smtpHost', provider.host);
        onChange('smtpPort', provider.port);
        onChange('smtpSecure', provider.secure);

        if (value === 'sendgrid') {
          onChange('smtpUser', 'apikey');
        }
      }
    },
    [onChange, providers],
  );

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testSmtpConnection(settings);
      if (result.success) {
        setTestResult({ success: true, message: result.message || 'Connection successful' });
      } else {
        setTestResult({ success: false, message: result.message || 'Connection failed' });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to connect';
      setTestResult({
        success: false,
        message,
      });
    } finally {
      setTesting(false);
    }
  };

  const authConfig = useMemo(
    () => getAuthFieldsConfig(settings.smtpProvider),
    [settings.smtpProvider],
  );

  return (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h2">
            SMTP Configuration
          </Text>
          <Text as="p" tone="subdued">
            Configure your own email server to send quote notifications from your own email address.
            If disabled, we'll use our default email service.
          </Text>

          <Checkbox
            label="Enable Custom SMTP"
            checked={settings.smtpEnabled}
            onChange={(value) => onChange('smtpEnabled', value)}
          />

          {settings.smtpEnabled && (
            <FormLayout>
              <Select
                label="Email Provider"
                options={providerOptions}
                value={settings.smtpProvider}
                onChange={handleProviderChange}
              />

              <TextField
                label="Sender Email (From)"
                value={settings.smtpFrom}
                onChange={(value) => onChange('smtpFrom', value)}
                placeholder="noreply@yourstore.com"
                autoComplete="email"
                helpText="The email address your customers will see."
              />

              <FormLayout.Group>
                <TextField
                  label={authConfig.userLabel}
                  value={settings.smtpUser}
                  onChange={(value) => onChange('smtpUser', value)}
                  autoComplete="email"
                  helpText={authConfig.userHelpText}
                />
                <TextField
                  label={authConfig.passLabel}
                  type="password"
                  value={settings.smtpPass}
                  onChange={(value) => onChange('smtpPass', value)}
                  autoComplete="current-password"
                  helpText={authConfig.passHelpText}
                />
              </FormLayout.Group>

              <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                <Button
                  variant="plain"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  ariaExpanded={showAdvanced}
                  ariaControls="advanced-smtp-settings"
                >
                  {showAdvanced ? 'Hide advanced server settings' : 'Show advanced server settings'}
                </Button>
              </div>

              <Collapsible
                open={showAdvanced}
                id="advanced-smtp-settings"
                transition={{ duration: '200ms', timingFunction: 'ease-in-out' }}
              >
                <div style={{ paddingTop: '8px', paddingBottom: '16px' }}>
                  <FormLayout>
                    <FormLayout.Group>
                      <TextField
                        label="SMTP Host"
                        value={settings.smtpHost}
                        onChange={(value) => onChange('smtpHost', value)}
                        autoComplete="off"
                      />
                      <TextField
                        label="SMTP Port"
                        type="number"
                        value={String(settings.smtpPort)}
                        onChange={(value) => onChange('smtpPort', Number.parseInt(value, 10) || 0)}
                        autoComplete="off"
                      />
                    </FormLayout.Group>
                    <Checkbox
                      label="Use SSL/TLS (Secure)"
                      checked={settings.smtpSecure}
                      onChange={(value) => onChange('smtpSecure', value)}
                    />
                  </FormLayout>
                </div>
              </Collapsible>

              <BlockStack gap="200">
                <InlineStack align="end">
                  <Button
                    onClick={handleTestConnection}
                    loading={testing}
                    disabled={!settings.smtpHost || !settings.smtpUser}
                  >
                    Test Connection
                  </Button>
                </InlineStack>

                {testResult && (
                  <Banner tone={testResult.success ? 'success' : 'critical'}>
                    <p>{testResult.message}</p>
                  </Banner>
                )}
              </BlockStack>
            </FormLayout>
          )}
        </BlockStack>
      </Card>

      {settings.smtpEnabled &&
        (settings.smtpProvider === 'google' || settings.smtpProvider === 'outlook') && (
          <Banner tone="info" title="Note on Google/Outlook Security">
            <p>
              To use {settings.smtpProvider === 'google' ? 'Gmail' : 'Outlook'}, you must create an
              <strong> App Password</strong> in your account settings. Standard passwords will not
              work if Two-Factor Authentication (2FA) is enabled.
            </p>
          </Banner>
        )}
    </BlockStack>
  );
};
