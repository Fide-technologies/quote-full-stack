import type { IForm, FormDocument } from "@/types/form.types";

export interface IFormRepository {
    findByShop(shop: string): Promise<FormDocument | null>;
    createOrUpdate(shop: string, formData: Partial<IForm>): Promise<FormDocument>;
}
