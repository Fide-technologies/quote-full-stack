import mongoose, { Schema } from "mongoose";
import type { IMerchant, MerchantDocument } from "@/types";
import { SUBSCRIPTION_STATUS_VALUES, DEFAULT_SUBSCRIPTION_STATUS } from "@/constants";

const merchantSchema = new Schema<IMerchant>(
    {
        shop: { type: String, required: true, unique: true },
        accessToken: { type: String, required: true },
        scopes: { type: String },
        email: { type: String },
        shopOwner: { type: String },
        currency: { type: String },
        subscriptionStatus: {
            type: String,
            enum: SUBSCRIPTION_STATUS_VALUES,
            default: DEFAULT_SUBSCRIPTION_STATUS,
        },
        isActive: { type: Boolean, default: true },
        planId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Plan",
            index: true,
        },
        usage: {
            quotesUsed: { type: Number, default: 0 },
            quotaPeriodStart: { type: Date, default: null },
        },
        installedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export const Merchant = mongoose.model<IMerchant>("Merchant", merchantSchema);
export type { IMerchant, MerchantDocument };
