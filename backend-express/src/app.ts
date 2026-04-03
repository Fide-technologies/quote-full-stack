import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { shopify } from "@/config/shopify.config";
import { logger } from "@/utils/logger";
import { env } from "@/validations/env.validation";
import { API_MESSAGES, HTTP_STATUS } from "@/constants/app.constants";

// Routes
import authRouter from "./routes/auth.routes";
import quotesRouter from "./routes/quotes.routes";
import webhooksRouter from "./routes/webhooks.routes";
import merchantsRouter from "./routes/merchants.routes";
import settingsRouter from "./routes/settings.routes";
import draftOrderRouter from "./routes/draft-order.routes";
import planRouter from "./routes/plan.routes";
import formRouter from "./routes/form.routes";
import dashboardRouter from "./routes/dashboard.routes";
import uploadRouter from "./routes/upload.routes";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";

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
        // Global Rate Limiter to prevent brute force and DoS
        const globalLimiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 1000, // limit each IP to 1000 requests per windowMs
            message: {
                success: false,
                message: "Too many requests from this IP, please try again later."
            },
            standardHeaders: true,
            legacyHeaders: false,
        });

        this.app.use(globalLimiter);
    }

    private config(): void {
        // shopify.cspHeaders() sets the frame-ancestors CSP directive
        // that allows Shopify's admin to embed this app in an iframe.
        this.app.use(shopify.cspHeaders());

        // Serve Static files
        this.app.use(express.static(STATIC_PATH));
        this.app.use('/public', express.static(path.join(__dirname, '..', 'public')));
    }

    private routes(): void {
        // Health Check with DB connectivity test
        this.app.get("/health", async (req, res) => {
            const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
            const status = dbStatus === "Connected" ? HTTP_STATUS.OK : HTTP_STATUS.INTERNAL_SERVER_ERROR;

            res.status(status).json({
                message: dbStatus === "Connected" ? "OK" : "Service Unavailable",
                database: dbStatus,
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            });
        });

        // 1. Webhooks MUST be registered before any body-parsing middleware
        // This is because shopify.processWebhooks needs the raw request body for HMAC verification
        this.app.use("/api/webhooks", webhooksRouter);

        // 2. Global body parsers for all other routes
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        // API Routes
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
        this.app.use((err: Error | unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
            const errorMessage = err instanceof Error ? (err.stack || err.message) : String(err);
            logger.error(`[GlobalErrorHandler] ${errorMessage}`);

            // Don't leak stack traces in production
            const responseMessage = process.env.NODE_ENV === 'production'
                ? API_MESSAGES.ERROR_DEFAULT
                : (err instanceof Error ? err.message : String(err));

            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: responseMessage
            });
        });
    }
}
