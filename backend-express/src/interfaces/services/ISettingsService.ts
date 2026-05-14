import type { Session } from "@shopify/shopify-api";

export interface ISettings {
    // 1. General Settings
    appEnabled: boolean;

    // 2. Quote Button Settings
    buttonText: string;
    hideAddToCart: boolean;
    buttonPosition: "product" | "collection" | "cart" | "all";
    showOnSelectedProducts: boolean;

    // 3. Pricing / Hide Price Settings
    hidePriceGlobal: boolean;
    loginToSeePrice: boolean;
    hidePriceByTags: string[];
    hidePriceByCollections: string[];

    // 4. Quote Behavior Settings
    allowPriceSuggestion: boolean;
    allowMultipleProducts: boolean;
    cartToQuote: boolean;
    redirectAfterSubmit: string;
    autoCreateDraftOrder: boolean;

    // 5. Customer Visibility Settings
    visibility: "all" | "logged_in" | "tags" | "b2b";
    customerTags: string[];

    // 6. Display Settings
    showOnProductPage: boolean;
    showOnCollectionPage: boolean;
    showOnHomePage: boolean;
    showOnCartPage: boolean;
    formType: "popup" | "inline";
    replacePrice: boolean;

    // 7. Notification Settings
    adminEmailEnabled: boolean;
    adminEmail: string;
    customerEmailEnabled: boolean;
    emailTemplate: string;

    // Legacy support (optional, if you want to keep showOnAll for a while)
    showOnAll?: boolean;
}

export interface ISettingsService {
    getSettings(session: Session): Promise<ISettings>;
    updateSettings(session: Session, settings: ISettings): Promise<void>;
    ensureMetafieldDefinitions(session: Session): Promise<void>;
    checkAppEmbedStatus(session: Session): Promise<{ isEmbedded: boolean; themeId: string }>;
}
