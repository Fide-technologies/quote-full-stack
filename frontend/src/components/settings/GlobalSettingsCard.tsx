import { BlockStack, Text, Icon, InlineStack, Box, SettingToggle, Badge } from "@shopify/polaris";
import { ViewIcon } from "@shopify/polaris-icons";

interface GlobalSettingsCardProps {
    showOnAll: boolean;
    onShowOnAllChange: (value: boolean) => void;
    disabled?: boolean;
}

export function GlobalSettingsCard({
    showOnAll,
    onShowOnAllChange,
    disabled = false
}: GlobalSettingsCardProps) {
    return (
        <SettingToggle
            action={{
                content: showOnAll ? 'Disable' : 'Enable',
                onAction: () => onShowOnAllChange(!showOnAll),
                disabled: disabled,
            }}
            enabled={showOnAll}
        >
            <InlineStack gap="400" wrap={false} blockAlign="center">
                <Box
                    padding="200"
                    background="bg-surface-secondary"
                    borderRadius="200"
                >
                    <Icon source={ViewIcon} tone="base" />
                </Box>
                <BlockStack gap="100">
                    <InlineStack gap="200" blockAlign="center">
                        <Text variant="bodyMd" fontWeight="semibold" as="span">
                            Show quote button on all products
                        </Text>
                        <Badge tone={showOnAll ? "success" : "attention"}>
                            {showOnAll ? "Enabled" : "Disabled"}
                        </Badge>
                    </InlineStack>
                    <Text variant="bodySm" tone="subdued" as="p">
                        When enabled, the quote request form will appear on every product page, replacing the price and buy buttons.
                    </Text>
                </BlockStack>
            </InlineStack>
        </SettingToggle>
    );
}
