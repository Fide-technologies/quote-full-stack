import type { HydratedDocument, Types } from "mongoose";

export enum FormFieldType {
    TEXT = "text",
    EMAIL = "email",
    PHONE = "phone",
    NUMBER = "number",
    TEXTAREA = "textarea",
    SELECT = "select",
    RADIO = "radio",
    CHECKBOX = "checkbox",
    FILE = "file"
}

export interface IFormField {
    id: string;
    type: FormFieldType;
    label: string;
    placeholder?: string;
    required: boolean;
    options?: string[]; // For select, radio, checkbox
    // Advanced Field Validations
    minLength?: number;
    maxLength?: number;
    validationRegex?: string;
    validationMessage?: string;
    // File constraints
    allowedFileTypes?: string;
    allowedImageFormats?: string[];
    maxFileSizeMB?: number;
    allowMultiple?: boolean;
    // UI layout Grid
    layoutWidth?: 'full' | 'half';
    // Access control
    isSystem?: boolean; // True for default locked fields
}

export interface IFormStep {
    id: string;
    title: string;
    description?: string;
    fields: IFormField[];
    isSystem?: boolean; // True for default locked steps
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
    createdAt: Date;
    updatedAt: Date;
}

export type FormDocument = HydratedDocument<IForm>;
