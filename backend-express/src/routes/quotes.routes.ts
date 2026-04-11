import { shopify } from "@/config/shopify.config";
import { PlanAction } from "@/constants/plan.constants";
import type { QuoteController } from "@/controllers/quote.controller";
import type { UploadController } from "@/controllers/upload.controller";
import { container } from "@/inversify.config";
import { planGuard } from "@/middlewares/plan-guard.middleware";
import { validateAppProxy } from "@/middlewares/proxy.middleware";
import { quoteSubmissionLimiter } from "@/middlewares/rate-limit.middleware";
import { upload } from "@/middlewares/upload.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { TYPES } from "@/types/types";
import { createQuoteSchema } from "@/validations/quote.validation";
import { Router, json } from "express";

const router = Router();
const quoteController = container.get<QuoteController>(TYPES.QuoteController);
const uploadController = container.get<UploadController>(TYPES.UploadController);

router.post("/upload", validateAppProxy, upload.array("images", 3), uploadController.uploadImages);

router.use(json());

router.post(
    "/",
    validateAppProxy,
    validate(createQuoteSchema),
    quoteSubmissionLimiter,
    planGuard(PlanAction.QUOTE_CREATE),
    quoteController.createQuote,
);

router.get("/export", shopify.validateAuthenticatedSession(), planGuard(), quoteController.exportQuotesCsv);

router.get("/:id", shopify.validateAuthenticatedSession(), planGuard(), quoteController.getQuoteById);
router.post("/:id/accept", shopify.validateAuthenticatedSession(), planGuard(), quoteController.acceptQuote);
router.post("/:id/reject", shopify.validateAuthenticatedSession(), planGuard(), quoteController.rejectQuote);
router.patch("/:id/status", shopify.validateAuthenticatedSession(), planGuard(), quoteController.updateStatus);
router.delete("/:id", shopify.validateAuthenticatedSession(), planGuard(), quoteController.deleteQuote);

router.get("/", shopify.validateAuthenticatedSession(), planGuard(), quoteController.getQuotes);

export default router;
