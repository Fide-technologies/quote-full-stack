export interface IFormField {
    id: string;
    type: string;
    label: string;
    placeholder?: string;
    required: boolean;
    options?: string[];
    // Advanced validations
    minLength?: number;
    maxLength?: number;
    validationRegex?: string;
    validationMessage?: string;
    allowedFileTypes?: string;
    allowedImageFormats?: string[];
    maxFileSizeMB?: number;
    allowMultiple?: boolean;
    // UI layout
    layoutWidth?: 'full' | 'half';
    isSystem?: boolean;
}

export interface IFormStep {
    id: string;
    title: string;
    description?: string;
    fields: IFormField[];
    isSystem?: boolean;
}

export interface IFormSettings {
    submitButtonText?: string;
    successMessage?: string;
}

export interface IForm {
    shop: string;
    title: string;
    settings: IFormSettings;
    steps: IFormStep[];
}

export async function getForm(): Promise<IForm> {
    const res = await fetch("/api/forms");
    if (!res.ok) throw new Error("Failed to load form configuration");
    const json = await res.json();
    return json.data;
}

export async function updateForm(formData: Partial<IForm>): Promise<IForm> {
    const res = await fetch("/api/forms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
    });
    if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Failed to save form configuration");
    }
    const json = await res.json();
    return json.data;
}
