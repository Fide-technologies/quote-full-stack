import type { IPlan, PlanDocument, IPlanFeatures } from "@/types";

export interface IPlanService {
    getPlanByName(name: string): Promise<PlanDocument | null>;
    getPlanById(id: string): Promise<PlanDocument | null>;
    getAllPlans(): Promise<PlanDocument[]>;
    createPlan(planData: Partial<IPlan>): Promise<PlanDocument>;
    getMerchantPlan(shop: string): Promise<PlanDocument | null>;
    checkQuoteLimit(shop: string): Promise<{ allowed: boolean; message?: string }>;
    getQuoteLimit(shop: string): Promise<number>;
    hasFeature(shop: string, feature: keyof IPlanFeatures): Promise<boolean>;
    createSubscription(session: any, planName: string): Promise<string>;
}
