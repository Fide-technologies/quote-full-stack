import type { QuoteStatus } from "@/constants";

// Quote Item Response DTO
export interface QuoteItemResponseDto {
    variantId?: string;
    quantity?: number;
    price?: number;
    title?: string;
}

// Quote Response DTO
export interface QuoteResponseDto {
    id: string;
    merchantId: string;
    shop: string;
    customerEmail: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    productTitle?: string;
    variantTitle?: string;
    quantity: number;
    address1?: string;
    address2?: string;
    city?: string;
    district?: string;
    state?: string;
    pincode?: string;
    customerMessage?: string;
    status: QuoteStatus;
    items: QuoteItemResponseDto[];
    totalPrice: number;
    originalPrice: number;
    requestedPrice?: number;
    draftOrderId?: string;
    draftOrderUrl?: string;
    productDetails?: {
        featuredImage?: {
            url: string;
            altText: string;
        };
    };
    createdAt: Date;
    updatedAt: Date;
}

// Create Quote Response DTO
export interface CreateQuoteResponseDto {
    success: boolean;
    message: string;
    data: QuoteResponseDto;
}

// Get Quotes Response DTO
export interface GetQuotesResponseDto {
    success: boolean;
    message: string;
    data: QuoteResponseDto[];
    total: number;
}

// Update Quote Response DTO
export interface UpdateQuoteResponseDto {
    success: boolean;
    message: string;
    data: QuoteResponseDto;
}

// Delete Quote Response DTO
export interface DeleteQuoteResponseDto {
    success: boolean;
    message: string;
}

// Error Response DTO
export interface ErrorResponseDto {
    success: false;
    message: string;
    errors?: Array<{
        field?: string;
        message: string;
    }>;
}
