import { injectable } from "inversify";
import { Plan } from "@/models/plan.model";
import type { IPlan, PlanDocument } from "@/types";
import type { IPlanRepository } from "@/interfaces";

@injectable()
export class PlanRepository implements IPlanRepository {
    async findByName(name: string): Promise<PlanDocument | null> {
        return await Plan.findOne({ name });
    }

    async findById(id: string): Promise<PlanDocument | null> {
        return await Plan.findById(id);
    }

    async create(planData: Partial<IPlan>): Promise<PlanDocument> {
        return await Plan.create(planData);
    }

    async findAll(): Promise<PlanDocument[]> {
        return await Plan.find();
    }

    async findOne(filter: any): Promise<PlanDocument | null> {
        return await Plan.findOne(filter);
    }
}
