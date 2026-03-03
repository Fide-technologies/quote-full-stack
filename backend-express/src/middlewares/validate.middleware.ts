import type { Request, Response, NextFunction } from "express";
import type { ZodError, ZodSchema } from "zod";
import type { ErrorResponseDto } from "@/dtos/quote.dto";

/**
 * Middleware to validate request data against a Zod schema
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */

export const validate = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (error) {
            const zodError = error as ZodError;
            const errorResponse: ErrorResponseDto = {
                success: false,
                message: "Validation failed",
                errors: zodError.issues?.map((err) => ({
                    field: err.path.join("."),
                    message: err.message,
                })) || [],
            };
            return res.status(400).json(errorResponse);
        }
    };
};
