import type { SubscriptionStatus } from "@/constants";
import type { HydratedDocument, Types } from "mongoose";

export interface IMerchantUsage {
    quotesUsed: number;
    quotaPeriodStart: Date | null;
}

export interface IMerchant {
    shop: string;
    accessToken: string;
    name?: string;
    scopes?: string;
    email?: string;
    shopOwner?: string;
    currency?: string;
    subscriptionStatus: SubscriptionStatus;
    isActive: boolean;
    planId?: Types.ObjectId;
    usage: IMerchantUsage;
    installedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export type MerchantDocument = HydratedDocument<IMerchant>;
