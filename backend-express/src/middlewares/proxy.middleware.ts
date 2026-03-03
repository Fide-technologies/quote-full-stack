import type { Request, Response, NextFunction } from "express";
import { shopify } from "@/config/shopify.config";
import { logger } from "@/utils/logger";

/**
 * Middleware to validate Shopify App Proxy requests.
 * Shopify app proxies send requests with a signature (HMAC) in the query parameters.
 */
export const validateAppProxy = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = req.query as Record<string, string | undefined>;

        // For App Proxy requests, we must specify the signator as "appProxy"
        // This makes it look for "signature" instead of "hmac" in the query
        const isValid = await shopify.api.utils.validateHmac(query, { signator: "appProxy" });

        if (!isValid) {
            logger.warn(`Invalid App Proxy request attempted for shop: ${query.shop}`);
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid signature"
            });
        }

        logger.debug("checking 1")

        // If valid, you can trust the 'shop' query parameter
        if (typeof query.shop === 'string') {
            req.shopify = {
                shop: query.shop
            };
        }

        logger.debug("checking 2")

        next();
    } catch (error) {
        logger.error("Error validating App Proxy request:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error during proxy validation"
        });
    }
};
