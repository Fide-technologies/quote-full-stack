import "reflect-metadata";
import "dotenv/config";
import { connectDB, disconnectDB } from "../config/mongo-db.config";
import { Plan } from "../models/plan.model";

async function check() {
    await connectDB();
    const plans = await Plan.find().lean();
    console.log(JSON.stringify(plans, null, 2));
    await disconnectDB();
    process.exit(0);
}
check();
