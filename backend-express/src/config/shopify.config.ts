import { ApiVersion, shopifyApp } from "@shopify/shopify-app-express";
import { LogSeverity, BillingInterval, BillingReplacementBehavior } from "@shopify/shopify-api";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-01"; // TODO: Upgrade to match ApiVersion
import { MongoDBSessionStorage } from "@shopify/shopify-app-session-storage-mongodb";
import { env } from "@/validations/env.validation";

const sessionStorage = new MongoDBSessionStorage(
    new URL(env.MONGODB_URI),
    env.MONGODB_NAME
);

const shopify = shopifyApp({
    api: {
        apiKey: env.SHOPIFY_API_KEY,
        apiSecretKey: env.SHOPIFY_API_SECRET,
        apiVersion: ApiVersion.July24,
        hostScheme: env.HOST_SCHEMA,
        hostName: env.HOST_NAME,
        isEmbeddedApp: true,
        scopes: env.SHOPIFY_SCOPES,
        restResources,
        logger: {
            level: env.NODE_ENV === "development" ? LogSeverity.Debug : LogSeverity.Error,
        },
        isTesting: true,
        isCustomStoreApp: false,
        billing: {
            "PRO": {
                test: true,
                replacementBehavior: BillingReplacementBehavior.ApplyImmediately,
                lineItems: [
                    {
                        amount: 14.99,
                        currencyCode: "USD",
                        interval: BillingInterval.Every30Days,
                        replacementBehavior: BillingReplacementBehavior.ApplyImmediately,
                    },
                ]
            },
        }
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
