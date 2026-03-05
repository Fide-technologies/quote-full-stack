import mongoose, { Schema } from "mongoose";
import type { IQuote, QuoteDocument } from "@/types/quote.types";
import { QUOTE_STATUS_VALUES, DEFAULT_QUOTE_STATUS } from "@/constants";

const quoteSchema = new Schema<IQuote>(
    {
        // --------------------
        // Relations
        // --------------------
        merchantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Merchant",
            required: true,
            index: true,
        },

        productId: String,
        productTitle: String,
        variantId: String,
        variantTitle: String,
        productImage: String,
        catalogId: String,
        companyId: String,
        companyLocationId: String,

        // --------------------
        // Shop
        // --------------------
        shop: {
            type: String,
            required: true,
            index: true,
        },


        // --------------------
        // Customer
        // --------------------
        customerName: String,
        firstName: String,
        lastName: String,
        customerEmail: {
            type: String,
            required: true,
        },
        email: String,
        phone: String,

        // --------------------
        // Address
        // --------------------
        address1: String,
        address2: String,
        city: String,
        district: String,
        state: String,
        pincode: String,
        country: String,

        // --------------------
        // Messages / Files
        // --------------------
        customerMessage: String,
        message: String,
        fileUrl: String,

        // --------------------
        // Pricing
        // --------------------
        originalPrice: {
            type: mongoose.Schema.Types.Decimal128,
            required: true,
        },
        requestedPrice: {
            type: mongoose.Schema.Types.Decimal128,
        },
        quantity: {
            type: Number,
            required: true,
            default: 1,
            min: 1,
        },

        // --------------------
        // Mongo-only
        // --------------------
        items: {
            type: [
                {
                    variantId: String,
                    title: String,
                    quantity: { type: Number, default: 1 },
                    price: Number,
                },
            ],
            default: [],
        },

        totalPrice: {
            type: Number,
            required: true,
            default: 0,
        },

        // --------------------
        // Status
        // --------------------
        status: {
            type: String,
            enum: QUOTE_STATUS_VALUES,
            required: true,
            default: DEFAULT_QUOTE_STATUS,
        },

        // --------------------
        // Draft Order Integration
        // --------------------
        draftOrderId: String,
        draftOrderUrl: String,

        // --------------------
        // Custom Form Data
        // --------------------
        customData: {
            type: Schema.Types.Mixed,
            default: {}
        },
        customImages: {
            type: [String],
            default: []
        },
    },
    { timestamps: true }
);

// totalPrice sync
quoteSchema.pre<QuoteDocument>("save", function () {
    if (this.originalPrice) {
        const price = Number(this.originalPrice.toString());
        this.totalPrice = price * (this.quantity || 1);
    }
});

export const Quote = mongoose.model<IQuote>("Quote", quoteSchema);
export type { IQuote, QuoteDocument };
