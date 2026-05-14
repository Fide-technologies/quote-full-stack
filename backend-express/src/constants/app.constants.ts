export const APP_DEFAULTS = {
    CURRENCY_CODE: "USD",
    QUOTE_ITEM_TITLE: "Quote Item",
    QUOTE_AMOUNT: "0.00",
    EMAIL_FROM: "udhay@fidelabs.io",
    EMAIL_SENDER_NAME: "Fide Technologies",
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
        buttonText: "",
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
        smtpEnabled: false,
        smtpProvider: "google",
        smtpHost: "smtp.gmail.com",
        smtpPort: 587,
        smtpSecure: false,
        smtpFrom: "",
        title: "Submit Your Quote Request",
        description: "Fill in your details and we'll get back to you shortly",
        successTitle: "Quote Requested Successfully!",
        successMessage: "Thank you for your request. Our team will review your quote and get back to you shortly.",
    },
    PRIVATE_KEY: "private_config",
};

export const SMTP_PROVIDER_PRESETS = [
    { label: "Gmail / Google Workspace", value: "google", host: "smtp.gmail.com", port: 587, secure: false },
    { label: "Outlook / Office 365", value: "outlook", host: "smtp.office365.com", port: 587, secure: false },
    { label: "Zoho Mail", value: "zoho", host: "smtp.zoho.com", port: 587, secure: false },
    { label: "SendGrid", value: "sendgrid", host: "smtp.sendgrid.net", port: 587, secure: false },
    { label: "Brevo (formerly Sendinblue)", value: "brevo", host: "smtp-relay.brevo.com", port: 587, secure: false },
    { label: "Mailgun", value: "mailgun", host: "smtp.mailgun.org", port: 587, secure: false },
    { label: "Amazon SES", value: "ses", host: "email-smtp.us-east-1.amazonaws.com", port: 587, secure: false },
    { label: "Elastic Email", value: "elastic", host: "smtp.elasticemail.com", port: 2525, secure: false },
    { label: "Netcore / Pepipost", value: "netcore", host: "smtp.pepipost.com", port: 587, secure: false },
    { label: "Custom SMTP", value: "custom", host: "", port: 587, secure: false },
];

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
