import { Router, json } from "express";
import { container } from "@/inversify.config";
import { TYPES } from "@/types/types";
import { QuoteController } from "@/controllers/quote.controller";
import { UploadController } from "@/controllers/upload.controller";
import { shopify } from "@/config/shopify.config";
import { validate } from "@/middlewares/validate.middleware";
import { createQuoteSchema } from "@/validations/quote.validation";
import { validateAppProxy } from "@/middlewares/proxy.middleware";
import { upload } from "@/middlewares/upload.middleware";
import { planGuard } from "@/middlewares/plan-guard.middleware";
import { PlanAction } from "@/constants/plan.constants";
import { quoteSubmissionLimiter } from "@/middlewares/rate-limit.middleware";

const router = Router();
const quoteController = container.get<QuoteController>(TYPES.QuoteController);
const uploadController = container.get<UploadController>(TYPES.UploadController);

router.post("/upload", validateAppProxy, upload.array('images', 3), uploadController.uploadImages);

router.use(json());

router.post("/", validateAppProxy, validate(createQuoteSchema), quoteSubmissionLimiter, planGuard(PlanAction.QUOTE_CREATE), quoteController.createQuote);

router.get("/export", shopify.validateAuthenticatedSession(), planGuard(), quoteController.exportQuotesCsv);

router.get("/:id", shopify.validateAuthenticatedSession(), planGuard(), quoteController.getQuoteById);

router.get("/", shopify.validateAuthenticatedSession(), planGuard(), quoteController.getQuotes);

export default router;
