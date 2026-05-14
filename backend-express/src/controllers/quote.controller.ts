import { API_MESSAGES, CONTROLLER, HTTP_STATUS } from "@/constants";
import type { IQuoteService } from "@/interfaces";
import { QuoteMapper } from "@/mappers/quote.mapper";
import { type IQuote, type QuoteDocument, TYPES } from "@/types";
import { logger } from "@/utils/logger";
import type { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { BaseController } from "./base.controller";

@injectable()
export class QuoteController extends BaseController {
    constructor(@inject(TYPES.IQuoteService) private quoteService: IQuoteService) {
        super();
    }

    public getQuotes = async (req: Request, res: Response) => {
        try {
            const session = res.locals.shopify.session;
            const page = Number.parseInt(req.query.page as string) || 1;
            const limit = Number.parseInt(req.query.limit as string) || 10;
            const q = req.query.q as string;
            const status = req.query.status as string;
            const date = req.query.date as string;
            const hasDraftOrder =
                req.query.hasDraftOrder === "true" ? true : req.query.hasDraftOrder === "false" ? false : undefined;

            const result = await this.quoteService.getEnrichedQuotesByMerchant(session, page, limit, {
                q,
                status,
                date,
                hasDraftOrder,
            });

            return this.ok(
                res,
                {
                    quotes: QuoteMapper.toResponseDtoList(result.data as QuoteDocument[]),
                    totalCount: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages,
                },
                API_MESSAGES.QUOTES.RETRIEVED,
            );
        } catch (error) {
            return this.handleError(res, error, API_MESSAGES.QUOTES.FAILED_RETRIEVE);
        }
    };

    getQuoteById = async (req: Request, res: Response) => {
        try {
            const session = res.locals.shopify.session;
            const id = req.params.id as string;

            if (!id) {
                return this.handleError(
                    res,
                    new Error("Quote ID is required"),
                    "Quote ID is required",
                    HTTP_STATUS.BAD_REQUEST,
                );
            }

            const quote = await this.quoteService.getQuoteById(session, id);

            if (!quote) {
                return this.handleError(
                    res,
                    new Error(API_MESSAGES.QUOTES.NOT_FOUND),
                    API_MESSAGES.QUOTES.NOT_FOUND,
                    HTTP_STATUS.NOT_FOUND,
                );
            }

            return this.ok(res, QuoteMapper.toResponseDto(quote), API_MESSAGES.QUOTES.RETRIEVED);
        } catch (error) {
            return this.handleError(res, error, API_MESSAGES.QUOTES.FAILED_RETRIEVE);
        }
    };

    public createQuote = async (req: Request, res: Response) => {
        try {
            const shop = req.shopify?.shop || res.locals.shopify?.session?.shop || req.body.shop;

            if (!shop) {
                return this.handleError(
                    res,
                    new Error(CONTROLLER.SHOP_REQUIRED),
                    CONTROLLER.AUTH_FAILED,
                    HTTP_STATUS.UNAUTHORIZED,
                );
            }

            const quote = await this.quoteService.createQuote(shop, req.body as Record<string, unknown>);

            return this.created(res, QuoteMapper.toResponseDto(quote), API_MESSAGES.QUOTES.CREATED);
        } catch (error) {
            logger.error("Error creating quote:", error);
            const message = error instanceof Error ? error.message : API_MESSAGES.QUOTES.FAILED_CREATE;
            const statusCode = message.includes("limit reached") ? HTTP_STATUS.FORBIDDEN : HTTP_STATUS.BAD_REQUEST;
            return this.handleError(res, error, message, statusCode);
        }
    };

    public exportQuotesCsv = async (req: Request, res: Response) => {
        try {
            const session = res.locals.shopify.session;
            const q = req.query.q as string;
            const status = req.query.status as string;
            const date = req.query.date as string;
            const hasDraftOrder =
                req.query.hasDraftOrder === "true" ? true : req.query.hasDraftOrder === "false" ? false : undefined;

            const result = await this.quoteService.getEnrichedQuotesByMerchant(session, 1, 10000, {
                q,
                status,
                date,
                hasDraftOrder,
            });
            const quotes = result.data;

            let csv = "Date,Customer,Email,Phone,Product,Quantity,Total Price,Status\n";

            for (const quote of quotes as QuoteDocument[]) {
                const dateVal = quote.createdAt ? quote.createdAt.toLocaleDateString() : "";
                const customer = `"${((quote.customerName as string) || `${(quote.firstName as string) || ""} ${(quote.lastName as string) || ""}`).trim().replace(/"/g, '""')}"`;
                const email = `"${((quote.email as string) || "").replace(/"/g, '""')}"`;
                const phone = `"${((quote.phone as string) || "").replace(/"/g, '""')}"`;
                const product = `"${((quote.productTitle as string) || "").replace(/"/g, '""')}"`;
                const quantity = quote.quantity?.toString() || "";
                const totalPrice = quote.totalPrice?.toString() || "";
                const statusVal = quote.status || "";

                csv += `${dateVal},${customer},${email},${phone},${product},${quantity},${totalPrice},${statusVal}\n`;
            }

            res.setHeader("Content-Type", "text/csv");
            res.setHeader("Content-Disposition", 'attachment; filename="quotes_export.csv"');
            return res.status(200).send(csv);
        } catch (error) {
            return this.handleError(res, error, "Failed to export CSV");
        }
    };

    public acceptQuote = async (req: Request, res: Response) => {
        try {
            const session = res.locals.shopify.session;
            const id = req.params.id as string;
            const { price, quantity, message } = req.body;

            if (!id || price === undefined || quantity === undefined) {
                return this.handleError(
                    res,
                    new Error("ID, price and quantity are required"),
                    "Missing required fields",
                    HTTP_STATUS.BAD_REQUEST,
                );
            }

            await this.quoteService.acceptQuote(session, id, Number(price), Number(quantity), message);

            return this.ok(res, null, "Quote accepted and email sent to customer");
        } catch (error) {
            return this.handleError(res, error, "Failed to accept quote");
        }
    };

    public rejectQuote = async (req: Request, res: Response) => {
        try {
            const session = res.locals.shopify.session;
            const id = req.params.id as string;
            const { message } = req.body;

            if (!id) {
                return this.handleError(res, new Error("Quote ID is required"), "Missing quote ID", HTTP_STATUS.BAD_REQUEST);
            }

            await this.quoteService.rejectQuote(session, id, message || "");

            return this.ok(res, null, "Quote rejected and email sent to customer");
        } catch (error) {
            return this.handleError(res, error, "Failed to reject quote");
        }
    };

    public updateStatus = async (req: Request, res: Response) => {
        try {
            const session = res.locals.shopify.session;
            const id = req.params.id as string;
            const { status } = req.body;

            if (!id || !status) {
                return this.handleError(res, new Error("ID and status are required"), "Missing fields", HTTP_STATUS.BAD_REQUEST);
            }

            const quote = await this.quoteService.updateQuoteStatus(session, id, status as IQuote["status"]);

            return this.ok(res, QuoteMapper.toResponseDto(quote!), "Status updated successfully");
        } catch (error) {
            return this.handleError(res, error, "Failed to update status");
        }
    };

    public deleteQuote = async (req: Request, res: Response) => {
        try {
            const session = res.locals.shopify.session;
            const id = req.params.id as string;

            if (!id) {
                return this.handleError(res, new Error("ID is required"), "ID required", HTTP_STATUS.BAD_REQUEST);
            }

            await this.quoteService.deleteQuote(session, id);

            return this.ok(res, null, "Quote deleted successfully");
        } catch (error) {
            return this.handleError(res, error, "Failed to delete quote");
        }
    };
}
