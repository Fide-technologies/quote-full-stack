import type { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { BaseController } from "./base.controller";
import { TYPES } from "@/types";
import { PlanType } from "@/constants/plan.constants";
import type { IPlanService, IMerchantService } from "@/interfaces";
import { shopify } from "@/config/shopify.config";
import { logger } from "@/utils/logger";
import { env } from "@/validations/env.validation";


@injectable()
export class PlanController extends BaseController {
    constructor(
        @inject(TYPES.IPlanService) private planService: IPlanService,
        @inject(TYPES.IMerchantService) private merchantService: IMerchantService
    ) {
        super();
    }

    async getCurrentPlan(req: Request, res: Response) {
        try {
            const session = res.locals.shopify.session;
            const merchant = await this.merchantService.getMerchantByShop(session.shop);
            const plan = await this.planService.getMerchantPlan(session.shop);
            return this.ok(res, { merchant, plan });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    async getAllPlans(req: Request, res: Response) {
        try {
            const plans = await this.planService.getAllPlans();
            return this.ok(res, plans);
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    async upgradePlan(req: Request, res: Response) {
        try {
            const session = res.locals.shopify.session;
            const shop = session.shop;
            const { planName, host } = req.body;

            logger.info(`[PlanController] Upgrade request: shop=${shop}, plan=${planName}`);

            if (!planName) {
                return this.fail(res, "Plan name is required", 400);
            }

            let confirmationUrl: string;

            if (planName === PlanType.FREE) {
                // For FREE plan, redirect to our callback for DB update and cancellation
                confirmationUrl = `https://${env.HOST_NAME}/api/plans/callback?shop=${shop}&plan=${planName}&host=${host || ""}`;
            } else {
                // For Managed Pricing (Pro/Ultimate), redirect to Shopify's managed selection page
                const shopName = shop.replace(".myshopify.com", "");
                confirmationUrl = `https://admin.shopify.com/store/${shopName}/apps/merchant-quote/plans`;
            }

            return this.ok(res, { confirmationUrl });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    async handleCallback(req: Request, res: Response) {
        // Normalize query params (handles both strings and arrays automatically)
        const { shop, host, charge_id, plan } = Object.fromEntries(
            Object.entries(req.query).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
        ) as Record<string, string>;

        logger.info(`[PlanController] Billing callback for shop: ${shop}`);

        try {
            if (!shop) {
                throw new Error("Missing shop parameter");
            }

            const appUrl = await this.planService.handleCallback(shop, charge_id, plan, host);
            return res.redirect(appUrl);
        } catch (error: any) {
            logger.error(`[PlanController] Callback failed: ${error.message}`);

            // Build safe fallback URL
            const params = new URLSearchParams({ shop: shop || '' });
            if (host) params.set('host', host);
            params.set('billing', 'error');

            return res.redirect(`https://${env.HOST_NAME}/plans?${params.toString()}`);
        }
    }

    async getChargeHistory(req: Request, res: Response) {
        try {
            const session = res.locals.shopify.session;
            const history = await this.planService.getChargeHistory(session);
            return this.ok(res, history);
        } catch (error) {
            return this.handleError(res, error);
        }
    }
}
