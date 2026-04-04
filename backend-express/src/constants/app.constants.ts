export const APP_DEFAULTS = {
    CURRENCY_CODE: "USD",
    QUOTE_ITEM_TITLE: "Quote Item",
    QUOTE_AMOUNT: "0.00",
    EMAIL_FROM: "quotes@example.com",
    EMAIL_SENDER_NAME: "Quote App",
};

export const API_MESSAGES = {
    SUCCESS: "Success",
    CREATED: "Created successfully",
    ERROR_DEFAULT: "An unexpected error occurred",
    DRAFT_ORDER: {
        CREATED: "Draft order created successfully",
        FAILED: "Failed to create draft order",
    },
    SETTINGS: {
        RETRIEVED: "Settings retrieved successfully",
        UPDATED: "Settings updated successfully",
        FAILED_RETRIEVE: "Failed to retrieve settings",
        FAILED_UPDATE: "Failed to update settings",
    },
    QUOTES: {
        RETRIEVED: "Quotes retrieved successfully",
        CREATED: "Quote created successfully",
        FAILED_RETRIEVE: "Failed to retrieve quotes",
        FAILED_CREATE: "Failed to create quote",
        NOT_FOUND: "Quote not found",
    },
};

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
};

export const EMAIL_SUBJECTS = {
    NEW_QUOTE: (name: string) => `New Quote Request from ${name}`,
    CUSTOMER_CONFIRMATION: "Quote Request Received",
};

export const PLAN_DEFAULTS = {
    FREE: {
        QUOTE_LIMIT: 50,
        REMOVE_BRANDING: false,
        EMAIL_NOTIFICATIONS: true,
        TRIAL_DAYS: 0,
    },
    PRO: {
        QUOTE_LIMIT: 10000,
        REMOVE_BRANDING: true,
        EMAIL_NOTIFICATIONS: true,
        TRIAL_DAYS: 7,
    },
    ULTIMATE: {
        QUOTE_LIMIT: 1000000, // Unlimited practically
        REMOVE_BRANDING: true,
        EMAIL_NOTIFICATIONS: true,
        TRIAL_DAYS: 14,
    },
};

export const QUOTE_ATTRIBUTES = {
    QUOTE_ID: "quote_id",
    QUOTE_STATUS: "quote_status",
};

export const SETTINGS_DEFAULTS = {
    NAMESPACE: "merchant_quote",
    KEY: "config",
    TYPE: "json",
    OWNER_TYPE_SHOP: "SHOP",
    DEFAULTS: {
        appEnabled: true,
        buttonText: "Request Quote",
        hideAddToCart: true,
        buttonPosition: "all",
        showOnSelectedProducts: false,
        hidePriceGlobal: false,
        loginToSeePrice: false,
        hidePriceByTags: [],
        hidePriceByCollections: [],
        allowPriceSuggestion: false,
        allowMultipleProducts: true,
        cartToQuote: true,
        redirectAfterSubmit: "",
        autoCreateDraftOrder: false,
        visibility: "all",
        customerTags: [],
        showOnProductPage: true,
        showOnCollectionPage: true,
        showOnHomePage: false,
        showOnCartPage: true,
        formType: "popup",
        replacePrice: true,
        adminEmailEnabled: true,
        adminEmail: "",
        customerEmailEnabled: true,
        emailTemplate: "Thank you for your quote request! We will get back to you soon.",
    },
};

export const SHOPIFY_DEFAULTS = {
    PRODUCT_GID_PREFIX: "gid://shopify/Product/",
    VARIANT_GID_PREFIX: "gid://shopify/ProductVariant/",
};

export const ERROR_MESSAGES = {
    DRAFT_ORDER: {
        API_NO_DATA: "Draft order API returned no data",
        CREATION_FAILED: "Failed to create draft order",
        CREATION_NULL: "Draft order creation returned null",
        QUOTE_REQUIRED: "Quote is required.",
        VARIANT_MISSING: "Product variant ID is missing.",
        QUANTITY_INVALID: "Quantity must be greater than 0.",
        EMAIL_MISSING: "Customer email is missing.",
        QUOTE_ID_REQUIRED: "Quote ID is required",
        VALIDATION_FAILED: "Quote validation failed: ",
    },
    QUOTE: {
        NOT_FOUND: "Quote not found",
        UNAUTHORIZED: "Unauthorized: Quote does not belong to this shop",
        DRAFT_ORDER_EXISTS: (id: string) => `Draft order already exists for quote ${id}: `,
        DRAFT_CREATED: (id: string) => `Draft order created and linked to quote ${id}`,
    },
    CONTROLLER: {
        MISSING_SHOP: "Shop parameter is required",
        MERCHANT_NOT_FOUND: "Merchant not found",
        AUTH_FAILED: "Authentication failed",
        SHOP_REQUIRED: "Shop is required",
    },
    MERCHANT: {
        NOT_FOUND: "Merchant not found",
        NOT_FOUND_FOR_SHOP: (shop: string) => `Merchant not found for shop: ${shop}`,
        NO_PLAN: "Merchant has no plan assigned",
        CURRENCY_CACHE_FAILED: "Failed to update merchant currency cache",
    },
    PLAN: {
        LIMIT_REACHED: (plan: string, limit: number) =>
            `Quote limit reached for ${plan} plan (${limit} quotes). Please upgrade your plan.`,
        NOT_FOUND: "Plan not found",
    },
    SETTINGS: {
        NO_SHOP_ID: "Could not retrieve Shop ID for metafield update",
        UPDATE_ERROR: "Shopify API Error: ",
    },
};

export const CONTROLLER = ERROR_MESSAGES.CONTROLLER;
