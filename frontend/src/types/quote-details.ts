
export interface QuoteCustomerDetailsProps {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    whatsappUrl: string;
}

export interface QuoteAddressDetailsProps {
    address1: string | null | undefined;
    address2: string | null | undefined;
    city: string | null | undefined;
    district: string | null | undefined;
    state: string | null | undefined;
    pincode: string | null | undefined;
}

export interface QuoteProductDetailsProps {
    productTitle: string;
    variantTitle: string | null | undefined;
    quantity: number;
    featuredImage: { url: string; altText: string } | null | undefined;
}

export interface QuoteMessageProps {
    message: string | null | undefined;
}

export interface QuoteDraftOrderInfoProps {
    draftOrderId: string | number | null | undefined;
    draftOrderUrl: string | null | undefined;
}

export interface QuoteSystemInfoProps {
    status: string;
    createdAt: string;
}
