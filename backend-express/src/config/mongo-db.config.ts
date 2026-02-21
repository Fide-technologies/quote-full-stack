import { env } from "@/validations/env.validation";
import mongoose from "mongoose";
import { logger } from "@/utils/logger";

export const connectDB = async () => {
    mongoose.connection.on("connected", () => {
        logger.info("MongoDB connected successfully")
    });

    mongoose.connection.on("error", (err) => {
        logger.error("MongoDB connection error", err);
    });

    mongoose.connection.on("disconnected", () => {
        logger.warn("MongoDB disconnected");
    });
    try {
        await mongoose.connect(env.MONGODB_URI, {
            maxConnecting: 100,
            maxPoolSize: 100,
            minPoolSize: 10,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            dbName: env.MONGODB_NAME
        });

    } catch (error) {
        logger.error("MongoDB connection error", error);
        process.exit(1);
    }
}

export const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        logger.info("MongoDB connection closed gracefully");
    } catch (error) {
        logger.error("Error closing MongoDB connection", error);
    }
};