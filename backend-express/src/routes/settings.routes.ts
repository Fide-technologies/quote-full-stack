import { shopify } from "@/config/shopify.config";
import { PlanAction } from "@/constants/plan.constants";
import type { SettingsController } from "@/controllers/settings.controller";
import { container } from "@/inversify.config";
import { planGuard } from "@/middlewares/plan-guard.middleware";
import { TYPES } from "@/types/types";
import { Router, json } from "express";

const router = Router();
const settingsController = container.get<SettingsController>(TYPES.SettingsController);

router.use(shopify.validateAuthenticatedSession());
router.use(json());

router.get("/", planGuard(PlanAction.SETTINGS_UPDATE), settingsController.getSettings);
router.put("/", planGuard(PlanAction.SETTINGS_UPDATE), settingsController.updateSettings);

export default router;
