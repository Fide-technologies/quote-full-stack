import { Router } from "express";
import { container } from "@/inversify.config";
import { TYPES } from "@/types";
import { MerchantController } from "@/controllers/merchant.controller";

const merchantsRouter = Router();
const merchantController = container.get<MerchantController>(TYPES.MerchantController);

// Publicly accessible for the storefront form to check features
merchantsRouter.get("/settings", merchantController.getSettings);

export default merchantsRouter;
