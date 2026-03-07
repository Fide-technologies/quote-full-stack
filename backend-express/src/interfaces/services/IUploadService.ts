import type { Express } from "express";

export interface IUploadService {
    uploadImages(files: Express.Multer.File[]): Promise<string[]>;
    getPresignedUrl(key: string): Promise<string>;
}
