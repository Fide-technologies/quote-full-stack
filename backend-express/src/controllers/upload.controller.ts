import { injectable } from "inversify";
import type { Request, Response } from "express";
import { BaseController } from "./base.controller";
import { API_MESSAGES, HTTP_STATUS } from "@/constants";

@injectable()
export class UploadController extends BaseController {
    public uploadImages = async (req: Request, res: Response) => {
        try {
            if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
                return this.fail(res, "No images uploaded", HTTP_STATUS.BAD_REQUEST);
            }

            const files = req.files as Express.Multer.File[];
            // Create full URLs for the uploaded images
            // In a real production app, this would be a Cloudinary/S3 URL
            const protocol = req.headers['x-forwarded-proto'] || req.protocol;
            const host = req.get('host');

            const urls = files.map(file => `${protocol}://${host}/public/uploads/${file.filename}`);

            return this.ok(res, { urls }, "Images uploaded successfully");
        } catch (error) {
            return this.handleError(res, error, "Failed to upload images");
        }
    };
}
