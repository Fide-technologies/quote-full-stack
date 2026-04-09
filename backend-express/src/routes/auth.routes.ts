import { shopify } from "@/config";
import type { AuthController } from "@/controllers";
import { container } from "@/inversify.config";
import { TYPES } from "@/types";
import { Router } from "express";

const router = Router();
const authController = container.get<AuthController>(TYPES.AuthController);

router.get("/", shopify.auth.begin());
router.get("/callback", authController.callbackStore, shopify.redirectToShopifyOrAppRoot());

export default router;
