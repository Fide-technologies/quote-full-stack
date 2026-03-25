import { z } from "zod";
import { logger } from "@/utils/logger";

const envSchema = z.object({
    MONGODB_URI: z.string().url(),
    MONGODB_NAME: z.string().min(1),
    PORT: z.coerce
        .number()
        .int()
        .min(1)
        .max(65535),

    SHOPIFY_API_KEY: z.string().min(1),
    SHOPIFY_API_SECRET: z.string().min(1),
    NODE_ENV: z.enum(["development", "production"]),

    SHOPIFY_SCOPES: z
        .string()
        .transform((val) => val.split(",").map(s => s.trim()))
        .refine(arr => arr.length > 0, {
            message: "SHOPIFY_SCOPES must have at least one scope",
        }),
    HOST_NAME: z.string().min(4),
    HOST_SCHEMA: z.enum(["http", "https"]),
    NGROK_AUTHTOKEN: z.string().min(1),

    NGROK_DOMAIN: z.string().min(1).optional(),

    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_SECURE: z.string().optional(),
    SMTP_FROM: z.string().optional(),

    // AWS S3 Configuration
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_REGION: z.string().optional(),
    AWS_S3_BUCKET: z.string().optional(),

    // Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
});


const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    logger.error("❌ Invalid environment variables");
    logger.error(JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1);
}

export const env = parsed.data;

