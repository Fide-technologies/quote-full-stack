import { Router } from "express";
import { container } from "@/inversify.config";
import { TYPES } from "@/types/types";
import { WebhooksController } from "@/controllers/webhoook.controller";

const router = Router();
const webhooksController = container.get<WebhooksController>(TYPES.WebhooksController);

router.post("/", webhooksController.process);

export default router;
