import { shopify } from "@/config/shopify.config";
import { PlanAction } from "@/constants/plan.constants";
import type { FormController } from "@/controllers/form.controller";
import { container } from "@/inversify.config";
import { planGuard } from "@/middlewares/plan-guard.middleware";
import { validateAppProxy } from "@/middlewares/proxy.middleware";
import { TYPES } from "@/types";
import { Router, json } from "express";

const formRouter = Router();
const formController = container.get<FormController>(TYPES.FormController);

formRouter.use(json());

// Proxy route for storefront injection
formRouter.get("/proxy", validateAppProxy, formController.getForm);

// Authenticated API routes for the backend application
formRouter.get(
    "/",
    shopify.validateAuthenticatedSession(),
    planGuard(PlanAction.CUSTOM_FORM_BUILDER),
    formController.getForm,
);
formRouter.put(
    "/",
    shopify.validateAuthenticatedSession(),
    planGuard(PlanAction.CUSTOM_FORM_BUILDER),
    formController.updateForm,
);

export default formRouter;
