import { injectable, inject } from "inversify";
import type { Request, Response } from "express";
import { BaseController } from "./base.controller";
import { TYPES } from "@/types";
import type { IUploadService } from "@/interfaces";
import { HTTP_STATUS } from "@/constants";

@injectable()
export class UploadController extends BaseController {
    constructor(
        @inject(TYPES.IUploadService) private readonly uploadService: IUploadService
    ) {
        super();
    }

    public uploadImages = async (req: Request, res: Response) => {
        try {
            if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
                return this.fail(res, "No images uploaded", HTTP_STATUS.BAD_REQUEST);
            }

            const files = req.files as Express.Multer.File[];

            // Upload to S3 (returns keys/names)
            const keys = await this.uploadService.uploadImages(files);

            // Get presigned URLs for each key
            const urls = await Promise.all(keys.map(key => this.uploadService.getPresignedUrl(key)));

            return this.ok(res, { urls, keys }, "Images uploaded successfully to S3");
        } catch (error) {
            return this.handleError(res, error, "Failed to upload images to S3");
        }
    };
}
