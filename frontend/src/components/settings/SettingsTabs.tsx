import React from "react";
import { BlockStack, Checkbox, Text } from "@shopify/polaris";
import { QuoteButtonSettings } from "./QuoteButtonSettings";
import { PricingSettings } from "./PricingSettings";
import type { ISettings } from "../../types/settings";

interface SettingsTabsProps {
    tabId: string;
    settings: ISettings;
    onChange: (key: keyof ISettings, value: unknown) => void;
}

export const SettingsTabs: React.FC<SettingsTabsProps> = ({ tabId, settings, onChange }) => {
    switch (tabId) {
        case "button":
            return <QuoteButtonSettings settings={settings} onChange={onChange} />;
        case "pricing":
            return <PricingSettings settings={settings} onChange={onChange} />;
        case "hide-buttons":
            return (
                <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">
                        Storefront Button Visibility
                    </Text>
                    <Checkbox
                        label="Hide 'Add to cart' button when quote is enabled"
                        checked={settings.hideAddToCart}
                        onChange={(v) => onChange("hideAddToCart", v)}
                    />
                    <Checkbox
                        label="Hide 'Buy It Now' button when quote is enabled"
                        checked={settings.hideBuyNow}
                        onChange={(v) => onChange("hideBuyNow", v)}
                        helpText="Disable dynamic checkout buttons like PayPal or Apple Pay."
                    />
                </BlockStack>
            );
        case "cart-widget":
            return <Text as="p">Quote cart widget settings coming soon.</Text>;
        case "history-widget":
            return <Text as="p">Quote history widget settings coming soon.</Text>;
        default:
            return null;
    }
};
