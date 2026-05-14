import { BlockStack, Button, Card, Icon, Layout, Page, Text } from '@shopify/polaris';
import { AlertCircleIcon } from '@shopify/polaris-icons';
import type React from 'react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  backAction?: { content: string; onAction: () => void };
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Error',
  message = 'Failed to load data. Please try again later.',
  onRetry,
  backAction,
}) => {
  return (
    <Page title={title} backAction={backAction}>
      <Layout>
        <Layout.Section>
          <Card padding="400">
            <BlockStack gap="400" align="center" inlineAlign="center">
              <Icon source={AlertCircleIcon} tone="critical" />
              <Text as="p" tone="critical">
                {message}
              </Text>
              {onRetry && <Button onClick={onRetry}>Retry</Button>}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};
