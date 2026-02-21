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
    provinceCode?: string;
    zip?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    countryCode?: string;
}

export interface DraftOrderInput {
    lineItems: DraftOrderLineItem[];
    email?: string;
    phone?: string;
    shippingAddress?: DraftOrderShippingAddress;
    billingAddress?: DraftOrderShippingAddress;
    note?: string;
    customAttributes?: Array<{ key: string; value: string }>;
}

export interface DraftOrderCreateResponse {
    draftOrderCreate: {
        draftOrder: {
            id: string;
            name: string;
            invoiceUrl: string;
            totalPrice: string;
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


export interface ShopResponse {
    shop: {
        currencyCode: string;
    };
}
