import { z } from "zod";

const quoteItemSchema = z.object({
    variantId: z.string().min(1, "Variant ID is required"),
    quantity: z.number().int().positive("Quantity must be a positive integer"),
    price: z.number().nonnegative("Price must be non-negative"),
    title: z.string().min(1, "Product title is required"),
});

export const createQuoteSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email format"),
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        phone: z.string().min(1, "Phone number is required"),
        address1: z.string().min(1, "Address is required"),
        address2: z.string().optional(),
        city: z.string().min(1, "City is required"),
        district: z.string().min(1, "District is required"),
        state: z.string().min(1, "State is required"),
        pincode: z.string().min(1, "Pincode is required"),
        message: z.string().optional(),
        shop: z.string().min(1, "Shop is required"),
        productId: z.string().min(1, "Product ID is required"),
        variantId: z.union([z.string(), z.number()]).transform((val) => String(val)).optional(),
        productTitle: z.string().min(1, "Product title is required"),
        quantity: z.union([z.string(), z.number()]).transform((val) => Number(val)),
        price: z.union([z.string(), z.number()]).transform((val) => Number(val)).optional(),
    }),
});

export const updateQuoteSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Quote ID is required"),
    }),
    body: z.object({
        status: z.enum(["PENDING", "APPROVED", "REJECTED", "PROCESSED", "CLOSED"]).optional(),
        items: z.array(quoteItemSchema).optional(),
        totalPrice: z.number().nonnegative("Total price must be non-negative").optional(),
    }),
});

export type CreateQuoteRequest = z.infer<typeof createQuoteSchema>["body"];
export type UpdateQuoteRequest = z.infer<typeof updateQuoteSchema>["body"];
export type QuoteItemRequest = z.infer<typeof quoteItemSchema>;
