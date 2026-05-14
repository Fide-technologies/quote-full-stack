import mongoose, { Schema, type Document } from "mongoose";

export interface IEmailConfig extends Document {
    shop: string;
    adminEmailEnabled: boolean;
    adminEmail: string;
    customerEmailEnabled: boolean;
    smtpEnabled: boolean;
    smtpProvider: string;
    smtpHost: string;
    smtpPort: number;
    smtpSecure: boolean;
    smtpFrom: string;
    smtpUser: string;
    smtpPass: string;
}

const emailConfigSchema = new Schema<IEmailConfig>({
    shop: { type: String, required: true, unique: true },
    adminEmailEnabled: { type: Boolean, default: true },
    adminEmail: { type: String, default: "" },
    customerEmailEnabled: { type: Boolean, default: true },
    smtpEnabled: { type: Boolean, default: false },
    smtpProvider: { type: String, default: "custom" },
    smtpHost: { type: String, default: "" },
    smtpPort: { type: Number, default: 587 },
    smtpSecure: { type: Boolean, default: false },
    smtpFrom: { type: String, default: "" },
    smtpUser: { type: String, default: "" },
    smtpPass: { type: String, default: "" },
}, { timestamps: true });

export const EmailConfig = mongoose.model<IEmailConfig>("EmailConfig", emailConfigSchema);
