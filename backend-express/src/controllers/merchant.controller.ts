import { inject, injectable } from "inversify";
import { TYPES } from "@/types";
import type { IPlanService, IMerchantService } from "@/interfaces";
import type { Request, Response } from "express";
import { BaseController } from "./base.controller";
import { API_MESSAGES, CONTROLLER } from "@/constants";

@injectable()
export class MerchantController extends BaseController {
    constructor(
        @inject(TYPES.IMerchantService) private merchantService: IMerchantService,
        @inject(TYPES.IPlanService) private planService: IPlanService
    ) {
        super();
    }

    public getSettings = async (req: Request, res: Response) => {
        try {
            // For public routes, we might use shop from query params or domain
            const shop = (req.query.shop as string) || (res.locals.shopify?.session?.shop);

            if (!shop) {
                return this.handleError(res, new Error(CONTROLLER.MISSING_SHOP), CONTROLLER.MISSING_SHOP);
            }

            const merchant = await this.merchantService.getMerchantByShop(shop);
            if (!merchant) {
                return this.handleError(res, new Error(CONTROLLER.MERCHANT_NOT_FOUND), CONTROLLER.MERCHANT_NOT_FOUND);
            }

            const plan = await this.planService.getMerchantPlan(shop);

            // If no plan is assigned, use default FREE features
            const features = plan?.features || {
                quoteLimit: 50,
                removeBranding: false,
                emailNotifications: false,
            };

            return this.ok(res, {
                shop: merchant.shop,
                plan: plan?.name || "FREE",
                features: features,
                usage: merchant.usage || { quotesUsed: 0 },
            }, API_MESSAGES.SETTINGS.RETRIEVED);
        } catch (error) {
            return this.handleError(res, error, API_MESSAGES.SETTINGS.FAILED_RETRIEVE);
        }
    };
}
