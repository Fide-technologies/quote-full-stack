import type mongoose from "mongoose";
import type { IEmailConfig } from "@/models/email-config.model";
import type { IBaseRepository } from "./IBaseRepository";

export interface IEmailConfigRepository extends IBaseRepository<IEmailConfig> {
    findByShop(shop: string): Promise<mongoose.HydratedDocument<IEmailConfig> | null>;
    upsertConfig(shop: string, config: Partial<IEmailConfig>): Promise<void>;
}
