import { z } from "zod";

const envSchema = z.object({
    PORT: z.coerce.number().default(3001),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    // Shopify Config
    SHOPIFY_API_KEY: z.string().min(1, "SHOPIFY_API_KEY is required"),
    SHOPIFY_API_SECRET: z.string().min(1, "SHOPIFY_API_SECRET is required"),
    SHOPIFY_SCOPES: z.string().default("write_products"),

    // App Config
    HOST_NAME: z.string().min(1, "HOST_NAME is required"),
    HOST_SCHEMA: z.enum(["http", "https"]).default("https"),

    // Ngrok (Optional for local dev)
    NGROK_AUTHTOKEN: z.string().optional(),
    NGROK_DOMAIN: z.string().optional(),

    // MongoDB
    MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
    MONGODB_NAME: z.string().min(1, "MONGODB_NAME is required"),

    // SMTP (Email)
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error("❌ Invalid environment variables:");
    console.error(_env.error.format());
    process.exit(1);
}

export const env = _env.data;
export type Env = z.infer<typeof envSchema>;
