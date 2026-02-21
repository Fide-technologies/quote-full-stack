import mongoose, { Schema } from "mongoose";
import type { IPlan, PlanDocument } from "@/types";
import { PLAN_TYPE_VALUES } from "@/constants";

const planSchema = new Schema<IPlan>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            enum: PLAN_TYPE_VALUES,
        },
        price: {
            type: mongoose.Schema.Types.Decimal128,
            required: true,
        },
        quoteLimit: {
            type: Number,
            required: true,
        },
        billingReset: {
            type: Boolean,
            default: false,
        },
        permissions: [{
            type: String,
        }],
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export const Plan = mongoose.model<IPlan>("Plan", planSchema);
export type { IPlan, PlanDocument };
