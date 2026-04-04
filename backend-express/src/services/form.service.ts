import type { IFormRepository, IFormService } from "@/interfaces";
import { TYPES } from "@/types";
import type { FormDocument, IForm } from "@/types";
import { inject, injectable } from "inversify";

@injectable()
export class FormService implements IFormService {
    constructor(@inject(TYPES.IFormRepository) private formRepository: IFormRepository) {}

    async getFormByShop(shop: string): Promise<FormDocument | null> {
        return await this.formRepository.findByShop(shop);
    }

    async saveForm(shop: string, formData: Partial<IForm>): Promise<FormDocument> {
        return await this.formRepository.createOrUpdate(shop, formData);
    }
}
