import mongoose, { Schema } from "mongoose";
import type { IForm, FormDocument, IFormStep, IFormField, IFormSettings } from "@/types/form.types";
import { FormFieldType } from "@/types/form.types";

const formFieldSchema = new Schema<IFormField>({
    id: { type: String, required: true },
    type: {
        type: String,
        enum: Object.values(FormFieldType),
        required: true
    },
    label: { type: String, required: true },
    placeholder: { type: String },
    required: { type: Boolean, default: false },
    options: [{ type: String }],
    minLength: { type: Number },
    maxLength: { type: Number },
    validationRegex: { type: String },
    validationMessage: { type: String },
    allowedFileTypes: { type: String },
    maxFileSizeMB: { type: Number },
    layoutWidth: { type: String, enum: ['full', 'half'], default: 'full' },
    isSystem: { type: Boolean, default: false }
}, { _id: false });

const formStepSchema = new Schema<IFormStep>({
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    fields: [formFieldSchema],
    isSystem: { type: Boolean, default: false }
}, { _id: false });

const formSettingsSchema = new Schema<IFormSettings>({
    submitButtonText: { type: String, default: "Submit Request" },
    successMessage: { type: String, default: "Your request has been submitted successfully." }
}, { _id: false });

const formSchema = new Schema<IForm>(
    {
        shop: {
            type: String,
            required: true,
            unique: true, // Assuming one custom form per shop for now
            index: true
        },
        title: {
            type: String,
            required: true,
            default: "Request a Quote"
        },
        settings: {
            type: formSettingsSchema,
            default: () => ({})
        },
        steps: {
            type: [formStepSchema],
            default: []
        }
    },
    { timestamps: true }
);

export const Form = mongoose.model<IForm>("Form", formSchema);
export type { IForm, FormDocument };
