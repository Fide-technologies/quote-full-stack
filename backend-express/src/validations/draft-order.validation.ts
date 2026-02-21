
import { z } from "zod";
import type { QuoteDocument } from "@/types";
import { ERROR_MESSAGES } from "@/constants";

export const createDraftOrderSchema = z.object({
    params: z.object({
        quoteId: z.string().min(1, ERROR_MESSAGES.DRAFT_ORDER.QUOTE_ID_REQUIRED),
    }),
});

export type CreateDraftOrderRequest = z.infer<typeof createDraftOrderSchema>;

/**
 * Validates if the quote has necessary information to create a draft order.
 * @param {QuoteDocument} quote The quote document to validate.
 * @throws Error if validation fails.
 */

export const validateQuoteForDraftOrder = (quote: QuoteDocument): void => {
    const errors: string[] = [];

    if (!quote) {
        throw new Error(ERROR_MESSAGES.DRAFT_ORDER.QUOTE_REQUIRED);
    }

    // Check for essential product info
    if (!quote.variantId) {
        errors.push(ERROR_MESSAGES.DRAFT_ORDER.VARIANT_MISSING);
    }

    if (!quote.quantity || quote.quantity <= 0) {
        errors.push(ERROR_MESSAGES.DRAFT_ORDER.QUANTITY_INVALID);
    }

    if (!quote.email && !quote.customerEmail) {
        errors.push(ERROR_MESSAGES.DRAFT_ORDER.EMAIL_MISSING);
    }

    if (errors.length > 0) {
        throw new Error(`${ERROR_MESSAGES.DRAFT_ORDER.VALIDATION_FAILED}${errors.join(" ")}`);
    }
};
