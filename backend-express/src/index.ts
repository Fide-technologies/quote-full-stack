import "reflect-metadata";
import "dotenv/config";
import http from "node:http";
import { connectDB, disconnectDB } from "@/config/mongo-db.config";
import { logger } from "@/utils/logger";
import { env } from "@/validations/env.validation";
import { App } from "./app";

import "./inversify.config";

async function bootstrap() {
    try {
        logger.info("Connecting to MongoDB...");
        await connectDB();

        const appInstance = new App();
        const app = appInstance.app;

        const server = http.createServer(app);

        logger.info("port is: ", env.PORT);

        server.listen(env.PORT, "0.0.0.0", async () => {
            const actualPort = env.PORT;

            console.log(`🚀 SERVER IS LIVE ON PORT: ${actualPort}`);
            console.log(`👉 Health check: http://${env.HOST_NAME}/health`);
            console.log(
                `🔧 Configuration: HOST_NAME=${env.HOST_NAME}, API_KEY=${env.SHOPIFY_API_KEY?.substring(0, 5)}...`,
            );

        });

        const shutdown = async (signal: string) => {
            logger.info(`Received ${signal}. Starting graceful shutdown...`);

            server.close(async () => {
                logger.info("HTTP server closed.");

                await disconnectDB();

                logger.info("Shutdown complete. Exiting process.");
                process.exit(0);
            });

            setTimeout(() => {
                logger.error("Could not close connections in time, forcefully shutting down");
                process.exit(1);
            }, 10000);
        };

        process.on("SIGTERM", () => shutdown("SIGTERM"));
        process.on("SIGINT", () => shutdown("SIGINT"));

        process.on("unhandledRejection", (reason, promise) => {
            logger.error("Unhandled Rejection at:", promise, "reason:", reason);
            if (env.NODE_ENV === "production") {
                shutdown("UNHANDLED_REJECTION");
            }
        });

        process.on("uncaughtException", (err) => {
            logger.error("Uncaught Exception thrown:", err);
            if (env.NODE_ENV === "production") {
                shutdown("UNCAUGHT_EXCEPTION");
            }
        });
    } catch (error) {
        logger.error("Fatal Error during bootstrap:", error);
        process.exit(1);
    }
}

bootstrap();
