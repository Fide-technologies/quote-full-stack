import "reflect-metadata";
import "dotenv/config";
import http from "node:http";
import { connectDB, disconnectDB } from "@/config/mongo-db.config";
import { logger } from "@/utils/logger";
import { env } from "@/validations/env.validation";
import { App } from "./app";

import "./inversify.config";
import cluster from "node:cluster";
import os from "node:os";

const numCPUs = os.cpus().length;

async function bootstrap() {
    if (env.NODE_ENV === "production" && cluster.isPrimary) {
        logger.info(`Primary process ${process.pid} is running. Forking for ${numCPUs} CPUs...`);

        // Fork workers.
        for (let i = 0; i < numCPUs; i++) {
            cluster.fork();
        }

        cluster.on("exit", (worker, code, signal) => {
            logger.warn(`Worker ${worker.process.pid} died. Signal: ${signal}, Code: ${code}. Restarting...`);
            cluster.fork();
        });

        return;
    }

    try {
        // 1. Connect to Database (Fail fast if DB is down)
        logger.info("Connecting to MongoDB...");
        await connectDB();

        // 2. Initialize Express Application
        const appInstance = new App();
        const app = appInstance.app;

        // 3. Create HTTP Server
        const server = http.createServer(app);

        logger.info("port is: ", env.PORT);

        // 4. Start Server
        server.listen(env.PORT, async () => {
            const actualPort = env.PORT;

            console.log(`🚀 SERVER IS LIVE ON PORT: ${actualPort}`);
            console.log(`👉 Health check: http://${env.HOST_NAME}/health`);
            console.log(
                `🔧 Configuration: HOST_NAME=${env.HOST_NAME}, API_KEY=${env.SHOPIFY_API_KEY?.substring(0, 5)}...`,
            );

            // 5. Setup Ngrok (Development Only)
            // Removed Ngrok setup since we are using Cloudflare Tunnels
        });

        // 6. Graceful Shutdown Implementation
        const shutdown = async (signal: string) => {
            logger.info(`Received ${signal}. Starting graceful shutdown...`);

            // Stop accepting new connections
            server.close(async () => {
                logger.info("HTTP server closed.");

                // Close database connection
                await disconnectDB();

                logger.info("Shutdown complete. Exiting process.");
                process.exit(0);
            });

            // Force exit if shutdown takes too long (e.g., 10s)
            setTimeout(() => {
                logger.error("Could not close connections in time, forcefully shutting down");
                process.exit(1);
            }, 10000);
        };

        // Listen for termination signals
        process.on("SIGTERM", () => shutdown("SIGTERM"));
        process.on("SIGINT", () => shutdown("SIGINT"));

        // Global crash prevention for unhandled rejections/exceptions
        process.on("unhandledRejection", (reason, promise) => {
            logger.error("Unhandled Rejection at:", promise, "reason:", reason);
            // In a worker, we might want to shut down gracefully and let cluster restart it
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
        // Ensure the process exits on fatal error so orchestration tools can restart it
        process.exit(1);
    }
}

// Start the application
bootstrap();
