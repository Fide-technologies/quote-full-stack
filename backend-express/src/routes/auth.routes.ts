import { Router } from "express";
import { container } from "@/inversify.config";
import { TYPES } from "@/types";
import { AuthController } from "@/controllers";
import { shopify } from "@/config";

const router = Router();
const authController = container.get<AuthController>(TYPES.AuthController);

router.get("/", shopify.auth.begin());
router.get("/callback", shopify.auth.callback(), authController.callbackStore, shopify.redirectToShopifyOrAppRoot());

export default router; 
