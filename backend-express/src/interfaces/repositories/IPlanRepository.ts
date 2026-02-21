import type { IPlan, PlanDocument } from "@/types";

export interface IPlanRepository {
    findByName(name: string): Promise<PlanDocument | null>;
    findById(id: string): Promise<PlanDocument | null>;
    create(planData: Partial<IPlan>): Promise<PlanDocument>;
    findAll(): Promise<PlanDocument[]>;
    findOne(filter: any): Promise<PlanDocument | null>;
}
