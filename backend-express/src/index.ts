import "reflect-metadata";
import "dotenv/config";
import http from "http";
import ngrok from "@ngrok/ngrok";
import { connectDB, disconnectDB } from "@/config/mongo-db.config";
import { logger } from "@/utils/logger";
import { env } from "@/validations/env.validation";
import { App } from "./app";

// Ensure DI container is loaded - critical for Inversify
import "./inversify.config";

async function bootstrap() {
    try {
        // 1. Connect to Database (Fail fast if DB is down)
        logger.info("Connecting to MongoDB...");
        await connectDB();

        // 2. Initialize Express Application
        const appInstance = new App();
        const app = appInstance.app;

        // 3. Create HTTP Server
        const server = http.createServer(app);

        // 4. Start Server
        server.listen(env.PORT, async () => {
            logger.info(`🚀 Server running on port ${env.PORT}`);
            logger.info(`👉 Health check: http://localhost:${env.PORT}/health`);

            // 5. Setup Ngrok (Development Only)
            if (env.NODE_ENV === "development" && env.NGROK_AUTHTOKEN) {
                try {
                    const url = await ngrok.connect({
                        addr: env.PORT,
                        domain: env.NGROK_DOMAIN,
                        authtoken: env.NGROK_AUTHTOKEN,
                    });
                    logger.info(`🌍 Ngrok tunnel established at: ${url}`);
                } catch (ngrokError) {
                    logger.error("Failed to connect to Ngrok:", ngrokError);
                }
            }
        });

        // 6. Graceful Shutdown Implementation
        const shutdown = async (signal: string) => {
            logger.info(`Received ${signal}. Starting graceful shutdown...`);

            // Stop accepting new connections
            server.close(async () => {
                logger.info("HTTP server closed.");

                // Close database connection
                await disconnectDB();

                // Disconnect Ngrok if in dev
                if (env.NODE_ENV === "development") {
                    await ngrok.disconnect();
                    logger.info("Ngrok disconnected.");
                }

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

    } catch (error) {
        logger.error("Fatal Error during bootstrap:", error);
        // Ensure the process exits on fatal error so orchestration tools can restart it
        process.exit(1);
    }
}

// Start the application
bootstrap();