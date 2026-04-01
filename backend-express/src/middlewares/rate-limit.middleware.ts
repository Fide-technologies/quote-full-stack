import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';

export const quoteSubmissionLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 3, // Limit each IP per store to 3 requests per `window` (here, per 1 minute)
    keyGenerator: (req: Request) => {
        // App proxy usually sets shopify.shop or query.shop
        const shop = (req as any).shopify?.shop || req.query?.shop || 'unknown';
        
        // Shopify proxy headers for actual client IP (ipKeyGenerator bypass token)
        const forwarded = req.headers['x-forwarded-for'] || req.headers['x-shopify-client-ip'] || req['ip'];
        let clientIp = 'unknown';
        if (Array.isArray(forwarded) && forwarded.length > 0) {
            clientIp = forwarded[0] || 'unknown';
        } else if (typeof forwarded === 'string' && forwarded) {
            clientIp = String(forwarded).split(',')[0]?.trim() || 'unknown';
        }

        return `${clientIp}_${shop}`;
    },
    message: {
        error: "You have exceeded the maximum number of quote submissions. Please wait a minute and try again."
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
