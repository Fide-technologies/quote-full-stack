import type { QuoteResponseDto } from "@/dtos/quote.dto";
import type { QuoteDocument } from "@/types";

export const QuoteMapper = {
    toResponseDto: (quote: any): QuoteResponseDto => {
        const id = quote._id || quote.id;
        const merchantId = quote.merchantId;

        return {
            id: id.toString(),
            merchantId: merchantId.toString(),
            shop: quote.shop,
            customerEmail: quote.customerEmail,
            firstName: quote.firstName,
            lastName: quote.lastName,
            email: quote.email || quote.customerEmail,
            phone: quote.phone,
            productTitle: quote.productTitle,
            variantTitle: quote.variantTitle,
            quantity: quote.quantity,
            address1: quote.address1,
            address2: quote.address2,
            city: quote.city,
            district: quote.district,
            state: quote.state,
            pincode: quote.pincode,
            customerMessage: quote.customerMessage,
            status: quote.status,
            items: quote.items || [],
            totalPrice: quote.totalPrice || 0,
            originalPrice: quote.originalPrice ? Number(quote.originalPrice.toString()) : 0,
            requestedPrice: quote.requestedPrice ? Number(quote.requestedPrice.toString()) : undefined,
            draftOrderId: quote.draftOrderId,
            draftOrderUrl: quote.draftOrderUrl,
            productDetails: quote.productDetails || (quote.productImage ? {
                featuredImage: {
                    url: quote.productImage,
                    altText: quote.productTitle || 'Product Image'
                }
            } : undefined),
            createdAt: quote.createdAt,
            updatedAt: quote.updatedAt,
        };
    },

    toResponseDtoList: (quotes: any[]): QuoteResponseDto[] => {
        return quotes.map((q) => QuoteMapper.toResponseDto(q));
    }
};
