import "reflect-metadata";
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { beforeAll, afterAll } from 'vitest';

let mongod: MongoMemoryServer;

// Set env vars DEFINITELY before anything else
process.env.NODE_ENV = "development";
process.env.MONGODB_URI = "mongodb://localhost:27017/test-unit";
process.env.MONGODB_NAME = "test-unit";
process.env.PORT = "8081";
process.env.SHOPIFY_API_KEY = "test_key";
process.env.SHOPIFY_API_SECRET = "test_secret";
process.env.SHOPIFY_SCOPES = "read_products,write_products";
process.env.HOST_NAME = "localhost";
process.env.HOST_SCHEMA = "http";
process.env.NGROK_AUTHTOKEN = "test_token";

beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    if (mongod) {
        await mongod.stop();
    }
});
