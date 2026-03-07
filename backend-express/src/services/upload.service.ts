import { injectable } from "inversify";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { IUploadService } from "@/interfaces";
import { env } from "@/validations/env.validation";
import { logger } from "@/utils/logger";
import type { Express } from "express";
import path from "path";

@injectable()
export class UploadService implements IUploadService {
    private s3Client: S3Client | null = null;
    private bucket: string;

    constructor() {
        this.bucket = env.AWS_S3_BUCKET || "";

        if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY && env.AWS_REGION) {
            this.s3Client = new S3Client({
                region: env.AWS_REGION,
                credentials: {
                    accessKeyId: env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
                },
            });
            logger.info("AWS S3 Client initialized.");
        } else {
            logger.warn("AWS S3 configuration missing. Image uploads are DISABLED. Please provide S3 credentials in the .env file.");
        }
    }

    async uploadImages(files: Express.Multer.File[]): Promise<string[]> {
        if (!this.s3Client) {
            throw new Error("S3 Client not initialized. Check AWS credentials.");
        }

        const uploadPromises = files.map(async (file) => {
            const fileExtension = path.extname(file.originalname);
            const fileName = `quotes/${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExtension}`;

            const params = {
                Bucket: this.bucket,
                Key: fileName,
                Body: file.buffer,
                ContentType: file.mimetype,
            };

            await this.s3Client!.send(new PutObjectCommand(params));

            // For public buckets, we can return the direct URL
            // return `https://${this.bucket}.s3.${env.AWS_REGION}.amazonaws.com/${fileName}`;

            // Or return the key and use presigned URLs if the bucket is private
            return fileName;
        });

        return Promise.all(uploadPromises);
    }

    async getPresignedUrl(key: string): Promise<string> {
        if (!this.s3Client) {
            throw new Error("S3 Client not initialized.");
        }

        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });

        return getSignedUrl(this.s3Client, command, { expiresIn: 3600 * 24 * 7 }); // 7 days
    }
}
