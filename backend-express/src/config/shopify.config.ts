import { env } from "@/validations/env.validation";
import { LogSeverity } from "@shopify/shopify-api";
import { restResources } from "@shopify/shopify-api/rest/admin/2026-01";
import { type ApiVersion, shopifyApp } from "@shopify/shopify-app-express";
import { MongoDBSessionStorage } from "@shopify/shopify-app-session-storage-mongodb";

const sessionStorage = new MongoDBSessionStorage(new URL(env.MONGODB_URI), env.MONGODB_NAME);

const shopify = shopifyApp({
    api: {
        apiKey: env.SHOPIFY_API_KEY,
        apiSecretKey: env.SHOPIFY_API_SECRET,
        apiVersion: "2026-01" as ApiVersion,
        hostScheme: env.HOST_SCHEMA,
        hostName: env.HOST_NAME,
        isEmbeddedApp: true,
        scopes: env.SHOPIFY_SCOPES,
        restResources,
        logger: {
            level: LogSeverity.Debug,
        },
        isTesting: false,
        isCustomStoreApp: false,
        future: {
            customerAddressDefaultFix: true,
            unstable_managedPricingSupport: true,
            unstable_newEmbeddedAuthStrategy: true
        },
    },
    auth: {
        path: "/api/auth",
        callbackPath: "/api/auth/callback",
    },
    webhooks: {
        path: "/api/webhooks",
    },
    sessionStorage,
});

export { shopify };
