import { Router, json } from "express";
import { container } from "@/inversify.config";
import { TYPES } from "@/types/types";
import { DraftOrderController } from "@/controllers/draft-order.controller";
import { shopify } from "@/config/shopify.config";
import { planGuard } from "@/middlewares/plan-guard.middleware";
import { PlanAction } from "@/constants/plan.constants";
import { validate } from "@/middlewares/validate.middleware";
import { createDraftOrderSchema } from "@/validations/draft-order.validation";

const router = Router();
const draftOrderController = container.get<DraftOrderController>(TYPES.DraftOrderController);

router.use(json());

router.post("/:quoteId", shopify.validateAuthenticatedSession(), validate(createDraftOrderSchema), planGuard(PlanAction.DRAFT_ORDER_CREATE), draftOrderController.createDraftOrder);

export default router;
