import "reflect-metadata";
import "dotenv/config";
import { connectDB, disconnectDB } from "../config/mongo-db.config";
import { Merchant } from "../models/merchant.model";

async function check() {
    await connectDB();
    const merchants = await Merchant.find().lean();
    console.log(JSON.stringify(merchants, null, 2));
    await disconnectDB();
    process.exit(0);
}
check();
