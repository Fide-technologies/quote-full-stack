import type { FormDocument, IForm, IFormField, IFormSettings, IFormStep } from "@/types/form.types";
import { FormFieldType } from "@/types/form.types";
import mongoose, { Schema } from "mongoose";

const formFieldSchema = new Schema<IFormField>(
    {
        id: { type: String, required: true },
        type: {
            type: String,
            enum: Object.values(FormFieldType),
            required: true,
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
        allowedImageFormats: [{ type: String }],
        maxFileSizeMB: { type: Number },
        allowMultiple: { type: Boolean, default: false },
        layoutWidth: { type: String, enum: ["full", "half"], default: "full" },
        isSystem: { type: Boolean, default: false },
    },
    { _id: false },
);

const formStepSchema = new Schema<IFormStep>(
    {
        id: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String },
        fields: [formFieldSchema],
        isSystem: { type: Boolean, default: false },
    },
    { _id: false },
);

const formSettingsSchema = new Schema<IFormSettings>(
    {
        successTitle: { type: String, default: "Quote Requested Successfully!" },
        successMessage: {
            type: String,
            default: "Thank you for your request. Our team will review your quote and get back to you shortly.",
        },
    },
    { _id: false },
);

const formSchema = new Schema<IForm>(
    {
        shop: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            default: "Request a Quote",
        },
        settings: {
            type: formSettingsSchema,
            default: () => ({}),
        },
        steps: {
            type: [formStepSchema],
            default: [],
        },
    },
    { timestamps: true },
);

export const Form = mongoose.model<IForm>("Form", formSchema);
export type { IForm, FormDocument };
