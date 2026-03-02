import { Router, json } from "express";
import { container } from "@/inversify.config";
import type { FormController } from "@/controllers/form.controller";
import { TYPES } from "@/types";
import { shopify } from "@/config/shopify.config";
import { planGuard } from "@/middlewares/plan-guard.middleware";
import { PlanAction } from "@/constants/plan.constants";
import { validateAppProxy } from "@/middlewares/proxy.middleware";

const formRouter = Router();
const formController = container.get<FormController>(TYPES.FormController);

formRouter.use(json());

// Proxy route for storefront injection
formRouter.get("/proxy", validateAppProxy, formController.getForm);

// Authenticated API routes for the backend application
formRouter.get("/", shopify.validateAuthenticatedSession(), formController.getForm);
formRouter.put("/", shopify.validateAuthenticatedSession(), planGuard(PlanAction.CUSTOM_FORM_BUILDER), formController.updateForm);

export default formRouter;
