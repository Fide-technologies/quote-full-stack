import { API_MESSAGES } from "@/constants/app.constants";
import type { IQuoteService } from "@/interfaces";
import { TYPES } from "@/types";
import type { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { BaseController } from "./base.controller";

@injectable()
export class DraftOrderController extends BaseController {
    constructor(@inject(TYPES.IQuoteService) private readonly quoteService: IQuoteService) {
        super();
    }

    public createDraftOrder = async (req: Request, res: Response) => {
        try {
            const session = res.locals.shopify.session;
            const { quoteId } = req.params as { quoteId: string };

            const result = await this.quoteService.createDraftOrder(session, quoteId);

            return this.ok(res, result, API_MESSAGES.DRAFT_ORDER.CREATED);
        } catch (error) {
            return this.handleError(res, error, API_MESSAGES.DRAFT_ORDER.FAILED);
        }
    };
}
