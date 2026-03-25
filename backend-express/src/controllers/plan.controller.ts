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
            const { planName } = req.body;

            logger.info(`[PlanController] Managed upgrade request: shop=${session.shop}, plan=${planName}`);

            if (!planName) {
                return this.fail(res, "Plan name is required", 400);
            }

            if (planName === PlanType.FREE) {
                // For FREE plan, redirect directly to our callback for DB update
                return this.ok(res, { 
                    confirmationUrl: `https://${env.HOST_NAME}/api/plans/callback?shop=${session.shop}&plan=${planName}` 
                });
            }

            const confirmationUrl = await this.planService.createSubscription(session, planName, req.query.host as string);

            if (confirmationUrl) {
                return this.ok(res, { confirmationUrl });
            }
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    async handleCallback(req: Request, res: Response) {
        // Extract all params safely as strings (Shopify can sometimes pass arrays)
        const rawShop = req.query.shop;
        const rawHost = req.query.host;
        const rawChargeId = req.query.charge_id;
        const rawPlan = req.query.plan;

        const shop = Array.isArray(rawShop) ? rawShop[0] : rawShop as string;
        const host = Array.isArray(rawHost) ? rawHost[0] : rawHost as string | undefined;
        const charge_id = Array.isArray(rawChargeId) ? rawChargeId[0] : rawChargeId as string | undefined;
        const plan = Array.isArray(rawPlan) ? rawPlan[0] : rawPlan as string | undefined;

        logger.info(`[PlanController] Billing callback: shop=${shop}, plan=${plan}, charge_id=${charge_id}`);

        res.setHeader('ngrok-skip-browser-warning', 'true');

        try {
            if (!shop) {
                logger.error(`[PlanController] Missing shop param in callback`);
                // Redirect to our own app root - avoid blank page
                return res.redirect(`https://${env.HOST_NAME}/plans`);
            }

            const appUrl = await this.planService.handleCallback(shop as string, charge_id as string, plan as string, host as string);
            logger.info(`[PlanController] Redirecting to: ${appUrl}`);
            return res.redirect(appUrl);
        } catch (error: any) {
            logger.error(`[PlanController] Callback error: ${error.message}`);

            // ALWAYS redirect back to OUR OWN app on error \u2014 never to admin.shopify.com directly
            // as that causes the blank page + App Bridge failure
            const fallback = shop
                ? `https://${env.HOST_NAME}/plans?shop=${shop}${host ? `&host=${host}` : ""}&billing=error`
                : `https://${env.HOST_NAME}/plans`;

            return res.redirect(fallback);
        }
    }
}
