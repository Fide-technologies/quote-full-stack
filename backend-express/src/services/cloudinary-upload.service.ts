import type { IUploadService } from "@/interfaces";
import { logger } from "@/utils/logger";
import { env } from "@/validations/env.validation";
import { v2 as cloudinary } from "cloudinary";
import type { Express } from "express";
import { injectable } from "inversify";

@injectable()
export class CloudinaryUploadService implements IUploadService {
    constructor() {
        if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
            cloudinary.config({
                cloud_name: env.CLOUDINARY_CLOUD_NAME,
                api_key: env.CLOUDINARY_API_KEY,
                api_secret: env.CLOUDINARY_API_SECRET,
            });
            logger.info("Cloudinary Client initialized.");
        } else {
            logger.error("Cloudinary configuration missing!");
        }
    }

    async uploadImages(files: Express.Multer.File[]): Promise<string[]> {
        const uploadPromises = files.map((file) => {
            return new Promise<string>((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: "quotes",
                    },
                    (error, result) => {
                        if (error) {
                            logger.error("Cloudinary Upload Error:", error);
                            return reject(error);
                        }
                        if (!result) {
                            return reject(new Error("Cloudinary upload returned no result"));
                        }
                        // Return the public_id as the "key" for the DB
                        resolve(result.public_id);
                    },
                );

                uploadStream.end(file.buffer);
            });
        });

        return Promise.all(uploadPromises);
    }

    async getPresignedUrl(publicId: string): Promise<string> {
        // Return the secure URL for a given public_id. Cloudinary handles this via direct URL or signed URL.
        // If the public_id is already a full URL (possible transition legacy), just return it.
        if (publicId.startsWith("http")) {
            return publicId;
        }

        return cloudinary.url(publicId, {
            secure: true,
            // You can add more transformation or signing here if needed
        });
    }
}
