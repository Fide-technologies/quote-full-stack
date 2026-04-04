export interface ISettings {
    // 1. General Settings
    appEnabled: boolean;
    storeName?: string;
    
    // 2. Quote Button Settings
    buttonText: string;
    buttonColor: string;
    buttonTextColor: string;
    hideAddToCart: boolean;
    hideBuyNow: boolean;
    placementLocation: 'above' | 'below';
    buttonPosition: 'product' | 'collection' | 'cart' | 'all';
    displayCondition: 'all' | 'products' | 'collections' | 'custom';
    selectedProducts: string[];
    selectedCollections: string[];
    productTags: string[];
    
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
    visibility: 'all' | 'logged_in' | 'tags' | 'b2b';
    customerTags: string[];
    
    // 6. Display Settings
    showOnProductPage: boolean;
    showOnCollectionPage: boolean;
    showOnHomePage: boolean;
    showOnCartPage: boolean;
    formType: 'popup' | 'inline';
    replacePrice: boolean;
    
    // 7. Notification Settings
    adminEmailEnabled: boolean;
    adminEmail: string;
    customerEmailEnabled: boolean;
    emailTemplate: string;
    
    // Server-side calculated fields (optional)
    plan?: string;
    isAppEmbedded?: boolean;
    deepLinkUrl?: string;
}

export const DEFAULT_SETTINGS: ISettings = {
    appEnabled: true,
    buttonText: "Request Quote",
    buttonColor: "#008060",
    buttonTextColor: "#FFFFFF",
    hideAddToCart: true,
    hideBuyNow: false,
    placementLocation: 'above',
    buttonPosition: 'all',
    displayCondition: 'all',
    selectedProducts: [],
    selectedCollections: [],
    productTags: [],
    hidePriceGlobal: false,
    loginToSeePrice: false,
    hidePriceByTags: [],
    hidePriceByCollections: [],
    allowPriceSuggestion: false,
    allowMultipleProducts: true,
    cartToQuote: true,
    redirectAfterSubmit: '',
    autoCreateDraftOrder: false,
    visibility: 'all',
    customerTags: [],
    showOnProductPage: true,
    showOnCollectionPage: true,
    showOnHomePage: false,
    showOnCartPage: true,
    formType: 'popup',
    replacePrice: true,
    adminEmailEnabled: true,
    adminEmail: '',
    customerEmailEnabled: true,
    emailTemplate: 'Thank you for your quote request! We will get back to you soon.',
};
