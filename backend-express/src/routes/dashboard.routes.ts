import { shopify } from "@/config/shopify.config";
import type { DashboardController } from "@/controllers/dashboard.controller";
import { container } from "@/inversify.config";
import { TYPES } from "@/types";
import { Router } from "express";

const dashboardRouter = Router();
const dashboardController = container.get<DashboardController>(TYPES.DashboardController);

// All dashboard routes should be protected by Shopify session validation
dashboardRouter.get("/stats", shopify.validateAuthenticatedSession(), dashboardController.getStats);

export default dashboardRouter;
