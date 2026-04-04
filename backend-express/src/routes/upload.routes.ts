import type { UploadController } from "@/controllers/upload.controller";
import { container } from "@/inversify.config";
import { validateAppProxy } from "@/middlewares/proxy.middleware";
import { upload } from "@/middlewares/upload.middleware";
import { TYPES } from "@/types";
import { Router } from "express";

const uploadRouter = Router();
const uploadController = container.get<UploadController>(TYPES.UploadController);

// We use any because we don't necessarily have a shop session in the body here if it's a multipart request
// But we can validate via proxy if needed, although multipart is tricky for proxy.
// For now, let's allow it but we might want to secure it.
uploadRouter.post("/", validateAppProxy, upload.array("images", 3), uploadController.uploadImages);

export default uploadRouter;
