import { injectable } from "inversify";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { IUploadService } from "@/interfaces";
import { env } from "@/validations/env.validation";
import { logger } from "@/utils/logger";
import type { Express } from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

@injectable()
export class S3UploadService implements IUploadService {

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
            logger.warn("AWS S3 configuration missing. Using LOCAL STORAGE for image uploads.");
            // Ensure public/uploads exists
            const uploadDir = path.join(__dirname, "..", "..", "public", "uploads");
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
        }
    }

    async uploadImages(files: Express.Multer.File[]): Promise<string[]> {
        if (!this.s3Client) {
            // Local Storage fallback
            const uploadPromises = files.map(async (file) => {
                const fileExtension = path.extname(file.originalname);
                const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExtension}`;
                const uploadDir = path.join(__dirname, "..", "..", "public", "uploads");
                const filePath = path.join(uploadDir, fileName);

                await fs.promises.writeFile(filePath, file.buffer);
                return fileName;
            });
            return Promise.all(uploadPromises);
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

            return fileName;
        });

        return Promise.all(uploadPromises);
    }

    async getPresignedUrl(key: string): Promise<string> {
        if (!this.s3Client) {
            // For local storage, return the direct URL
            // Ensure the URL is accessible via proxy or directly
            return `${env.HOST_SCHEMA}://${env.HOST_NAME}/public/uploads/${key}`;
        }

        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });

        return getSignedUrl(this.s3Client, command, { expiresIn: 3600 * 24 * 7 }); // 7 days
    }
}
