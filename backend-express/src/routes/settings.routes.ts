import { Router, json } from "express";
import { container } from "@/inversify.config";
import { TYPES } from "@/types/types";
import { SettingsController } from "@/controllers/settings.controller";
import { shopify } from "@/config/shopify.config";
import { planGuard } from "@/middlewares/plan-guard.middleware";
import { PlanAction } from "@/constants/plan.constants";

const router = Router();
const settingsController = container.get<SettingsController>(TYPES.SettingsController);

router.use(shopify.validateAuthenticatedSession());
router.use(json());

router.get("/", planGuard(PlanAction.SETTINGS_UPDATE), settingsController.getSettings);
router.put("/", planGuard(PlanAction.SETTINGS_UPDATE), settingsController.updateSettings);

export default router;
