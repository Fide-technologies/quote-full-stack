import { SubscriptionStatus } from "@/constants";
import type { IPlan, IPlanFeatures, PlanDocument } from "@/types";
import type { Session } from "@shopify/shopify-api";
import type { Types } from "mongoose";

export interface IPlanService {
    getPlanByName(name: string): Promise<PlanDocument | null>;
    getPlanById(id: string): Promise<PlanDocument | null>;
    getAllPlans(): Promise<PlanDocument[]>;
    createPlan(planData: Partial<IPlan>): Promise<PlanDocument>;
    getMerchantPlan(shop: string): Promise<PlanDocument | null>;
    checkQuoteLimit(shop: string): Promise<{ allowed: boolean; message?: string }>;
    getQuoteLimit(shop: string): Promise<number>;
    hasFeature(shop: string, feature: keyof IPlanFeatures): Promise<boolean>;
    createSubscription(session: Session, planName: string, host: string): Promise<string>;
    handleCallback(shop: string, charge_id?: string, plan?: string, host?: string): Promise<string>;
    verifyReinstallationBilling(
        session: Session,
    ): Promise<{ planId?: Types.ObjectId; subscriptionStatus?: SubscriptionStatus }>;
    handleSubscriptionUpdate(shop: string, subscriptionId: string): Promise<void>;
    getChargeHistory(session: Session): Promise<unknown>;
}
