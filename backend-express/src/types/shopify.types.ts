export interface DraftOrderLineItem {
    variantId?: string;
    quantity: number;
    priceOverride?: {
        amount: string;
        currencyCode: string;
    };
    title?: string;
}

export interface DraftOrderCustomer {
    id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
}

export interface DraftOrderShippingAddress {
    address1?: string;
    address2?: string;
    city?: string;
    company?: string;
    province?: string;
    provinceCode?: string;
    zip?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    country?: string;
    countryCode?: string;
    countryCodeV2?: string;
}

export interface DraftOrderInput {
    lineItems: DraftOrderLineItem[];
    email?: string;
    phone?: string;
    shippingAddress?: DraftOrderShippingAddress;
    billingAddress?: DraftOrderShippingAddress;
    note?: string;
    customAttributes?: Array<{ key: string; value: string }>;
    marketRegionCountryCode?: string;
}

export interface DraftOrderCreateResponse {
    draftOrderCreate: {
        draftOrder: {
            id: string;
            name: string;
            invoiceUrl: string;
            totalPriceSet: {
                shopMoney: {
                    amount: string;
                    currencyCode: string;
                };
            };
            shippingAddress?: DraftOrderShippingAddress;
            customer?: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
            lineItems: {
                edges: Array<{
                    node: {
                        id: string;
                        title: string;
                        quantity: number;
                        originalUnitPriceSet: {
                            shopMoney: {
                                amount: string;
                            };
                        };
                    };
                }>;
            };
        } | null;
        userErrors: Array<{
            field: string[];
            message: string;
        }>;
    };
}

// REST Shop Data
export interface ShopifyShopData {
    name: string;
    email: string;
    shop_owner: string;
    currency: string;
}

export interface ShopifyShopResponse {
    shop: ShopifyShopData;
}

// GraphQL Shop Currency
export interface ShopifyShopCurrencyResponse {
    shop: {
        currencyCode: string;
    };
}

// GraphQL Billing Query Result
export interface ShopifyBillingQueryResult {
    currentAppInstallation?: {
        allSubscriptions?: {
            edges?: Array<{
                node: {
                    status: string;
                    currentPeriodEnd: string;
                    name: string;
                };
            }>;
        };
    };
}
