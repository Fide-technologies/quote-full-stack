import type { WebhooksController } from "@/controllers/webhoook.controller";
import { container } from "@/inversify.config";
import { TYPES } from "@/types/types";
import { Router } from "express";

const router = Router();
const webhooksController = container.get<WebhooksController>(TYPES.WebhooksController);

router.post("/", webhooksController.process);

export default router;
