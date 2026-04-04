import type { IFormRepository } from "@/interfaces";
import { Form, type FormDocument, type IForm } from "@/models/form.model";
import { injectable } from "inversify";
import { MongooseBaseRepository } from "../base/base.repository";

@injectable()
export class FormRepository extends MongooseBaseRepository<IForm> implements IFormRepository {
    constructor() {
        super(Form);
    }

    async findByShop(shop: string): Promise<FormDocument | null> {
        return await this.findOne({ shop } as unknown);
    }

    async createOrUpdate(shop: string, formData: Partial<IForm>): Promise<FormDocument> {
        return (await this.model
            .findOneAndUpdate({ shop }, { $set: formData }, { new: true, upsert: true })
            .exec()) as FormDocument;
    }

    async deleteByShop(shop: string): Promise<unknown> {
        return await Form.deleteMany({ shop });
    }
}
