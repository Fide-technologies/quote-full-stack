import type { HydratedDocument, Types } from "mongoose";
import type { QuoteStatus } from "@/constants";

export interface IQuoteItem {
    variantId?: string;
    title?: string;
    quantity?: number;
    price?: number;
}

export interface IQuote {
    // Relations
    merchantId: Types.ObjectId;

    productId?: string;
    productTitle?: string;
    variantId?: string;
    variantTitle?: string;
    productImage?: string;
    catalogId?: string;
    companyId?: string;
    companyLocationId?: string;

    // Shop
    shop: string;

    // Customer
    customerName?: string;
    firstName?: string;
    lastName?: string;
    customerEmail: string;
    email?: string;
    phone?: string;

    // Address
    address1?: string;
    address2?: string;
    city?: string;
    district?: string;
    state?: string;
    pincode?: string;
    country?: string;

    // Messages / Files
    customerMessage?: string;
    message?: string;
    fileUrl?: string;

    // Pricing
    originalPrice: Types.Decimal128;
    requestedPrice?: Types.Decimal128;
    quantity: number;

    // Mongo-only
    items: IQuoteItem[];
    totalPrice: number;

    // Status / Timestamps
    status: QuoteStatus;
    createdAt: Date;
    updatedAt: Date;

    // Custom Form Data
    customData?: Record<string, any>;
    customImages?: string[];

    // Draft Order Integration
    draftOrderId?: string;
    draftOrderUrl?: string;
}

export type QuoteDocument = HydratedDocument<IQuote>;
