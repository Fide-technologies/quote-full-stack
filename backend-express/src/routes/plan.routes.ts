import { Router } from "express";
import { container } from "@/inversify.config";
import type { PlanController } from "@/controllers/plan.controller";
import { TYPES } from "@/types";
import { shopify } from "@/config/shopify.config";

const planRouter = Router();
const planController = container.get<PlanController>(TYPES.PlanController);

// Callback route - Request comes from Shopify redirect, so it doesn't have the session token header
// We should rely on HMAC validation or simply redirect to the embedded app to let it handle session
planRouter.get("/callback", (req, res) => planController.handleCallback(req, res));

// Authenticated routes - Requests come from the embedded app with session token
planRouter.use(shopify.validateAuthenticatedSession());

planRouter.get("/", (req, res) => planController.getAllPlans(req, res));
planRouter.get("/current", (req, res) => planController.getCurrentPlan(req, res));
planRouter.post("/upgrade", (req, res) => planController.upgradePlan(req, res));

export default planRouter;
