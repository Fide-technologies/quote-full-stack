import { Router, json } from "express";
import { container } from "@/inversify.config";
import { TYPES } from "@/types/types";
import { QuoteController } from "@/controllers/quote.controller";
import { shopify } from "@/config/shopify.config";
import { validate } from "@/middlewares/validate.middleware";
import { createQuoteSchema } from "@/validations/quote.validation";
import { validateAppProxy } from "@/middlewares/proxy.middleware";
import { planGuard } from "@/middlewares/plan-guard.middleware";
import { PlanAction } from "@/constants/plan.constants";

const router = Router();
const quoteController = container.get<QuoteController>(TYPES.QuoteController);

router.use(json());

router.post("/", validateAppProxy, validate(createQuoteSchema), planGuard(PlanAction.QUOTE_CREATE), quoteController.createQuote);

router.get("/", shopify.validateAuthenticatedSession(), planGuard(), quoteController.getQuotes);

export default router;
