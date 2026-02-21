import type { HydratedDocument, Types } from "mongoose";
import type { PlanType } from "@/constants";

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
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type PlanDocument = HydratedDocument<IPlan>;
