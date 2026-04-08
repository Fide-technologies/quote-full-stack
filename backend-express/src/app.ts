import path from "node:path";
import { fileURLToPath } from "node:url";
import { shopify } from "@/config/shopify.config";
import { API_MESSAGES, HTTP_STATUS } from "@/constants/app.constants";
import { logger } from "@/utils/logger";
import { env } from "@/validations/env.validation";
import express from "express";

import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
// Routes
import authRouter from "./routes/auth.routes";
import dashboardRouter from "./routes/dashboard.routes";
import draftOrderRouter from "./routes/draft-order.routes";
import formRouter from "./routes/form.routes";
import merchantsRouter from "./routes/merchants.routes";
import planRouter from "./routes/plan.routes";
import quotesRouter from "./routes/quotes.routes";
import settingsRouter from "./routes/settings.routes";
import uploadRouter from "./routes/upload.routes";
import webhooksRouter from "./routes/webhooks.routes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STATIC_PATH = path.join(__dirname, "..", "..", "frontend", "dist");

export class App {
    public app: express.Application;

    constructor() {
        this.app = express();
        this.securityConfig();
        this.config();
        this.routes();
        this.errorHandling();
    }

    private securityConfig(): void {
        this.app.set("trust proxy", 1);

        const globalLimiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 1000,
            message: {
                success: false,
                message: "Too many requests from this IP, please try again later.",
            },
            standardHeaders: true,
            legacyHeaders: false,
        });

        this.app.use(globalLimiter);
    }

    private config(): void {
        this.app.use(shopify.cspHeaders());

        this.app.use(express.static(STATIC_PATH));
        this.app.use("/public", express.static(path.join(__dirname, "..", "public")));
    }

    private routes(): void {
        this.app.get("/health", async (req, res) => {
            const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
            const status = dbStatus === "Connected" ? HTTP_STATUS.OK : HTTP_STATUS.INTERNAL_SERVER_ERROR;

            res.status(status).json({
                message: dbStatus === "Connected" ? "OK" : "Service Unavailable",
                database: dbStatus,
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
            });
        });

        this.app.use("/api/webhooks", webhooksRouter);

        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        this.app.use("/api/auth", authRouter);
        this.app.use("/api/quotes", quotesRouter);
        this.app.use("/api/merchants", merchantsRouter);
        this.app.use("/api/settings", settingsRouter);
        this.app.use("/api/draft-orders", draftOrderRouter);
        this.app.use("/api/plans", planRouter);
        this.app.use("/api/forms", formRouter);
        this.app.use("/api/dashboard", dashboardRouter);
        this.app.use("/api/upload", uploadRouter);

        // Frontend Fallback (SPA)
        // Must be last
        this.app.use((req, res, next) => {
            if (req.path.startsWith("/api")) return next();
            res.sendFile(path.join(STATIC_PATH, "index.html"));
        });
    }

    private errorHandling(): void {
        this.app.use(
            (err: Error | any, req: express.Request, res: express.Response, next: express.NextFunction) => {
                const errorMessage = err instanceof Error ? err.stack || err.message : String(err);
                logger.error(`[GlobalErrorHandler] ${errorMessage}`);

                // Extract Shopify specific error details if available
                const shopifyError = err?.response?.errors || err?.message;
                const statusCode = err?.response?.status || err?.networkStatusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;

                // Don't leak stack traces in production
                const responseMessage =
                    process.env.NODE_ENV === "production"
                        ? (err?.message || API_MESSAGES.ERROR_DEFAULT)
                        : errorMessage;

                res.status(statusCode).json({
                    success: false,
                    message: responseMessage,
                    error: process.env.NODE_ENV !== "production" ? err : undefined,
                    shopifyDetails: err?.response || undefined
                });
            },
        );
    }
}
