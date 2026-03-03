import { injectable } from "inversify";
import type { IFormRepository } from "@/interfaces";
import { Form } from "@/models/form.model";
import type { IForm, FormDocument } from "@/types";

@injectable()
export class FormRepository implements IFormRepository {
    async findByShop(shop: string): Promise<FormDocument | null> {
        return await Form.findOne({ shop });
    }

    async createOrUpdate(shop: string, formData: Partial<IForm>): Promise<FormDocument> {
        return await Form.findOneAndUpdate(
            { shop },
            { $set: formData },
            { new: true, upsert: true }
        );
    }
}
