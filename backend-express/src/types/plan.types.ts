import type { PlanType } from "@/constants";
import type { HydratedDocument, Types } from "mongoose";

export interface IPlanFeatures {
    quoteLimit: number;
    removeBranding: boolean;
    emailNotifications: boolean;
}

export interface IPlan {
    name: PlanType;
    price: Types.Decimal128;
    quoteLimit: number;
    billingReset: boolean;
    permissions: string[];
    features?: IPlanFeatures;
    trialDays: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type PlanDocument = HydratedDocument<IPlan>;
