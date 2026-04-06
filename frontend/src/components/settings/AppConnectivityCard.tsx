import React from 'react';
import {
  Card,
  Text,
  Badge,
  Button,
  BlockStack,
  InlineStack,
  Tooltip,
} from '@shopify/polaris';
import { RefreshIcon } from '@shopify/polaris-icons';
import { useAppExtensions } from '../../hooks/useAppExtensions';

interface AppConnectivityCardProps {
  isAppEnabled: boolean;
  deepLinkUrl: string;
  loading?: boolean;
}

export const AppConnectivityCard: React.FC<AppConnectivityCardProps> = ({
    deepLinkUrl,
    loading: serverLoading = false,
}) => {
    const { isEmbedded, isLoading: extensionsLoading, refresh } = useAppExtensions();

    const loading = serverLoading || extensionsLoading;
    const isAppEnabled = isEmbedded ?? false;

  return (
    <Card background={!loading && !isAppEnabled ? "bg-surface-secondary-active" : "bg-surface"}>
      <BlockStack gap="300">
        {loading ? (
           <BlockStack gap="200">
             <div style={{ width: '100px', height: '20px', backgroundColor: 'var(--p-color-bg-fill-tertiary)', borderRadius: '4px' }} />
             <div style={{ width: '100%', height: '40px', backgroundColor: 'var(--p-color-bg-fill-tertiary)', borderRadius: '4px' }} />
           </BlockStack>
        ) : (
          <>
            <BlockStack gap="100">
              <InlineStack align="space-between" blockAlign="center">
                <InlineStack gap="100" blockAlign="center">
                  <Text variant="headingSm" as="h3" fontWeight="semibold">
                    App Connectivity
                  </Text>
                  <Tooltip content="Sync Status">
                    <Button 
                      icon={RefreshIcon} 
                      variant="tertiary" 
                      onClick={refresh} 
                      size="slim"
                    />
                  </Tooltip>
                </InlineStack>
                <Badge tone={isAppEnabled ? "success" : "critical"}>
                  {isAppEnabled ? "Active" : "Disabled"}
                </Badge>
              </InlineStack>
              <Text as="p" variant="bodySm" tone="subdued">
                {isAppEnabled
                  ? "Your app is currently live and visible on your storefront."
                  : "The app is not visible to customers. Enable it to start receiving quotes."}
              </Text>
            </BlockStack>

            <a
              href={deepLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
            >
              <Button
                variant="primary"
                fullWidth
                tone={!isAppEnabled ? "success" : undefined}
              >
                {isAppEnabled ? "Manage in Theme" : "Enable App Embed"}
              </Button>
            </a>
          </>
        )}
      </BlockStack>
    </Card>
  );
};
