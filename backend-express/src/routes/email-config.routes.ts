import { Router, json } from "express";
import { container } from "@/inversify.config";
import type { EmailConfigController } from "@/controllers/email-config.controller";
import { TYPES } from "@/types";
import { shopify } from "@/config/shopify.config";
import { planGuard } from "@/middlewares/plan-guard.middleware";
import { PlanAction } from "@/constants/plan.constants";

const emailConfigRouter = Router();
const controller = container.get<EmailConfigController>(TYPES.EmailConfigController);

emailConfigRouter.use(shopify.validateAuthenticatedSession());
emailConfigRouter.use(json());

emailConfigRouter.get("/", planGuard(PlanAction.SETTINGS_UPDATE), controller.getConfig);
emailConfigRouter.put("/", planGuard(PlanAction.SETTINGS_UPDATE), controller.updateConfig);
emailConfigRouter.get("/smtp-providers", planGuard(PlanAction.SETTINGS_UPDATE), controller.getSmtpProviders);
emailConfigRouter.post("/test-smtp", planGuard(PlanAction.SETTINGS_UPDATE), controller.testSmtp);

export default emailConfigRouter;
