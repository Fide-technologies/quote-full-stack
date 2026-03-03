import "reflect-metadata";
import "dotenv/config";
import { connectDB, disconnectDB } from "../config/mongo-db.config";
import { Plan } from "../models/plan.model";
import { PlanType, PlanAction } from "../constants/plan.constants";
import { logger } from "../utils/logger";

const plans = [
    {
        name: PlanType.FREE,
        price: 0.00,
        quoteLimit: 50,
        billingReset: false,
        permissions: [
            PlanAction.QUOTE_CREATE,
            PlanAction.QUOTE_UPDATE,
            PlanAction.QUOTE_SEND,
            PlanAction.SETTINGS_UPDATE
        ],
        isActive: true
    },
    {
        name: PlanType.PRO,
        price: 9.99,
        quoteLimit: 10000,
        billingReset: true,
        permissions: [
            PlanAction.QUOTE_CREATE,
            PlanAction.QUOTE_UPDATE,
            PlanAction.QUOTE_SEND,
            PlanAction.DRAFT_ORDER_CREATE,
            PlanAction.SETTINGS_UPDATE,
            PlanAction.CUSTOM_FORM_BUILDER,
            PlanAction.REMOVE_BRANDING,
            PlanAction.MERCHANT_EMAIL_NOTIFICATIONS
        ],
        isActive: true
    }
];

async function seedPlans() {
    try {
        await connectDB();
        logger.info("Connected to DB for seeding plans...");

        for (const planData of plans) {
            const existingPlan = await Plan.findOne({ name: planData.name });
            if (existingPlan) {
                logger.info(`Updating existing plan: ${planData.name}`);
                existingPlan.permissions = planData.permissions;
                existingPlan.quoteLimit = planData.quoteLimit;
                await existingPlan.save();
            } else {
                logger.info(`Creating new plan: ${planData.name}`);
                await Plan.create(planData);
            }
        }

        logger.info("Plans seeded successfully.");
    } catch (error) {
        logger.error("Error seeding plans:", error);
    } finally {
        await disconnectDB();
        process.exit(0);
    }
}

seedPlans();
