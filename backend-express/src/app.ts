import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { shopify } from "@/config/shopify.config";
import { logger } from "@/utils/logger";
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STATIC_PATH = path.join(__dirname, "..", "..", "frontend", "dist");

export class App {
    public app: express.Application;

    constructor() {
        this.app = express();
        this.config();
        this.routes();
        this.errorHandling();
    }

    private config(): void {
        // Security headers for Shopify
        this.app.use(shopify.cspHeaders());

        // Body parsing is handled by Shopify for some routes, or Express for others
        // If needed, add express.json() for non-webhook routes, but be careful with raw body requirements
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        // Serve Static files
        this.app.use(express.static(STATIC_PATH));
        this.app.use('/public', express.static(path.join(__dirname, '..', 'public')));
    }

    private routes(): void {
        // Health Check
        this.app.get("/health", (req, res) => {
            res.status(HTTP_STATUS.OK).json({ message: "OK", timestamp: new Date().toISOString() });
        });

        // API Routes
        this.app.use("/api/auth", authRouter);
        this.app.use("/api/quotes", quotesRouter);
        this.app.use("/api/webhooks", webhooksRouter);
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
