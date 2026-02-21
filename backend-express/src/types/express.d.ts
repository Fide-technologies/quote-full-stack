import { Session } from "@shopify/shopify-api";

declare global {
    namespace Express {
        interface Request {
            merchantId?: string;
            shopify?: {
                shop: string;
            };
        }
        interface Locals {
            shopify: {
                session: Session;
            };
        }
    }
}

export { };
