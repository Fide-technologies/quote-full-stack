import { injectable, inject } from "inversify";
import { TYPES } from "@/types";
import type { IFormRepository, IFormService } from "@/interfaces";
import type { IForm, FormDocument } from "@/types";

@injectable()
export class FormService implements IFormService {
    constructor(
        @inject(TYPES.IFormRepository) private formRepository: IFormRepository
    ) { }

    async getFormByShop(shop: string): Promise<FormDocument | null> {
        return await this.formRepository.findByShop(shop);
    }

    async saveForm(shop: string, formData: Partial<IForm>): Promise<FormDocument> {
        return await this.formRepository.createOrUpdate(shop, formData);
    }
}
