import type { IForm, FormDocument } from "@/types/form.types";

export interface IFormService {
    getFormByShop(shop: string): Promise<FormDocument | null>;
    saveForm(shop: string, formData: Partial<IForm>): Promise<FormDocument>;
}
