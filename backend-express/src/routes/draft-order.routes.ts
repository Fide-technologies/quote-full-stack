import { shopify } from "@/config/shopify.config";
import { PlanAction } from "@/constants/plan.constants";
import type { DraftOrderController } from "@/controllers/draft-order.controller";
import { container } from "@/inversify.config";
import { planGuard } from "@/middlewares/plan-guard.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { TYPES } from "@/types/types";
import { createDraftOrderSchema } from "@/validations/draft-order.validation";
import { Router, json } from "express";

const router = Router();
const draftOrderController = container.get<DraftOrderController>(TYPES.DraftOrderController);

router.use(json());

router.post(
    "/:quoteId",
    shopify.validateAuthenticatedSession(),
    validate(createDraftOrderSchema),
    planGuard(PlanAction.DRAFT_ORDER_CREATE),
    draftOrderController.createDraftOrder,
);

export default router;
