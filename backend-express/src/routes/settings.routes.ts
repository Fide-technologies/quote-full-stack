import { Router, json } from "express";
import { container } from "@/inversify.config";
import { TYPES } from "@/types/types";
import { SettingsController } from "@/controllers/settings.controller";
import { shopify } from "@/config/shopify.config";

const router = Router();
const settingsController = container.get<SettingsController>(TYPES.SettingsController);

router.use(shopify.validateAuthenticatedSession());
router.use(json());

router.get("/", settingsController.getSettings);
router.put("/", settingsController.updateSettings);

export default router;
