import { inject, injectable } from "inversify";
import { TYPES } from "@/types";
import type { IQuoteService } from "@/interfaces";
import type { Request, Response } from "express";
import { BaseController } from "./base.controller";
import { QuoteMapper } from "@/mappers/quote.mapper";
import { logger } from "@/utils/logger";
import { API_MESSAGES, CONTROLLER, HTTP_STATUS } from "@/constants";

@injectable()
export class QuoteController extends BaseController {
    constructor(
        @inject(TYPES.IQuoteService) private quoteService: IQuoteService
    ) {
        super();
    }

    public getQuotes = async (req: Request, res: Response) => {
        try {
            const session = res.locals.shopify.session;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const q = req.query.q as string;
            const status = req.query.status as string;
            const date = req.query.date as string;
            const hasDraftOrder = req.query.hasDraftOrder === 'true' ? true : req.query.hasDraftOrder === 'false' ? false : undefined;

            const result = await this.quoteService.getEnrichedQuotesByMerchant(session, page, limit, { q, status, date, hasDraftOrder });

            return this.ok(
                res,
                {
                    quotes: QuoteMapper.toResponseDtoList(result.data as any),
                    totalCount: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages
                },
                API_MESSAGES.QUOTES.RETRIEVED
            );
        } catch (error) {
            return this.handleError(res, error, API_MESSAGES.QUOTES.FAILED_RETRIEVE);
        }
    };

    public createQuote = async (req: Request, res: Response) => {
        try {
            const shop = req.shopify?.shop || res.locals.shopify?.session?.shop || req.body.shop;

            if (!shop) {
                return this.handleError(res, new Error(CONTROLLER.SHOP_REQUIRED), CONTROLLER.AUTH_FAILED, HTTP_STATUS.UNAUTHORIZED);
            }

            const quote = await this.quoteService.createQuote(shop, req.body);

            return this.created(
                res,
                QuoteMapper.toResponseDto(quote),
                API_MESSAGES.QUOTES.CREATED
            );
        } catch (error) {
            logger.error("Error creating quote:", error);
            const message = error instanceof Error ? error.message : API_MESSAGES.QUOTES.FAILED_CREATE;
            const statusCode = message.includes("limit reached") ? HTTP_STATUS.FORBIDDEN : HTTP_STATUS.BAD_REQUEST;
            return this.handleError(res, error, message, statusCode);
        }
    };
}
