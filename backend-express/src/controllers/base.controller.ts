import { injectable } from "inversify";
import type { Response } from "express";
import { API_MESSAGES, HTTP_STATUS } from "@/constants";

@injectable()
export abstract class BaseController {
    /**
     * @param(res: Response) - Response object
     * @param(data: T) - Data to be sent
     * @param(message: string) - Message to be sent
     * @param(extras: Record<string, unknown>) - Extra data to be sent
     * @returns {Response<T>}
     * Send a success response (200 OK)
     */
    protected ok<T>(res: Response, data: T, message: string = API_MESSAGES.SUCCESS, extras: Record<string, unknown> = {}) {
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message,
            data,
            ...extras,
        });
    }

    /**
     * @param(res: Response) - Response object
     * @param(data: T) - Data to be sent
     * @param(message: string) - Message to be sent
     * @returns {Response<T>}
     * Send a created response (201 Created)
     */
    protected created<T>(res: Response, data: T, message: string = API_MESSAGES.CREATED) {
        return res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message,
            data,
        });
    }

    /**
     * @param(res: Response) - Response object
     * @param(message: string) - Message to be sent
     * @param(statusCode: number) - Status code
     * @param(errors: unknown[]) - Errors to be sent
     * @returns {Response<T>}
     * Send an error response
     */
    protected fail(res: Response, message: string, statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors?: unknown[]) {
        return res.status(statusCode).json({
            success: false,
            message,
            errors,
        });
    }

    /**
     * Handle common error scenarios
     * @param(res: Response) - Response object
     * @param(error: unknown) - Error to be sent
     * @param(defaultMessage: string) - Default message to be sent
     * @param(statusCode: number) - Status code
     * @returns {Response<T>}
     * Handle common error scenarios
     */
    protected handleError(res: Response, error: unknown, defaultMessage: string = API_MESSAGES.ERROR_DEFAULT, statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR) {
        const message = error instanceof Error ? error.message : defaultMessage;
        return this.fail(res, message, statusCode);
    }
}
