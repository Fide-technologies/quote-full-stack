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
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        fname: z.string().optional(),
        lname: z.string().optional(),
        phone: z.string().min(1, "Phone number is required"),
        address1: z.string().min(1, "Address is required"),
        address2: z.string().optional(),
        city: z.string().min(1, "City is required"),
        district: z.string().min(1, "District is required"),
        state: z.string().min(1, "State is required"),
        pincode: z.string().min(1, "Pincode is required"),
        message: z.string().optional(),
        shop: z.string().min(1, "Shop is required"),
        productId: z.union([z.string(), z.number()]).transform((val) => String(val)),
        variantId: z.union([z.string(), z.number()]).transform((val) => String(val)).optional(),
        productTitle: z.string().min(1, "Product title is required"),
        quantity: z.union([z.string(), z.number()]).optional().default(1).transform((val) => {
            const num = Number(val);
            return isNaN(num) ? 1 : num;
        }),
        price: z.union([z.string(), z.number()]).optional().default(0).transform((val) => {
            const num = Number(val);
            return isNaN(num) ? 0 : num;
        }),
        customData: z.record(z.string(), z.any()).optional(),
        customImages: z.array(z.string()).optional(),
    }).transform(data => ({
        ...data,
        firstName: data.firstName || data.fname || "",
        lastName: data.lastName || data.lname || "",
    })).refine(data => data.firstName.length > 0, {
        message: "First name is required",
        path: ["firstName"]
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
