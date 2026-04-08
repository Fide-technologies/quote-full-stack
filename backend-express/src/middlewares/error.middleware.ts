import type express from "express";
import { API_MESSAGES, HTTP_STATUS } from "@/constants/app.constants";
import { logger } from "@/utils/logger";
import type { ShopifyError } from "../interfaces/shopify-error";

export const globalErrorHandler = (
    err: unknown,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    const error = err as ShopifyError;
    const errorMessage = err instanceof Error ? err.stack || err.message : String(err);
    logger.error(`[GlobalErrorHandler] ${errorMessage}`);

    // Extract Shopify specific error details if available
    const statusCode = error?.response?.status || error?.networkStatusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;

    // Don't leak stack traces in production
    const responseMessage =
        process.env.NODE_ENV === "production"
            ? (error?.message || API_MESSAGES.ERROR_DEFAULT)
            : errorMessage;

    res.status(statusCode).json({
        success: false,
        message: responseMessage,
        error: process.env.NODE_ENV !== "production" ? err : undefined,
        shopifyDetails: error?.response || undefined
    });
};
