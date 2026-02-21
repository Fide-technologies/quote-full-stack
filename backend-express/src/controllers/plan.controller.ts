import type { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { BaseController } from "./base.controller";
import { TYPES } from "@/types";
import type { IPlanService, IMerchantService } from "@/interfaces";
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
            const plan = await this.planService.getMerchantPlan(session.shop);
            return this.ok(res, plan);
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

            if (!planName) {
                return this.fail(res, "Plan name is required", 400);
            }

            const confirmationUrl = await this.planService.createSubscription(session, planName);
            return this.ok(res, { confirmationUrl });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    async handleCallback(req: Request, res: Response) {
        try {
            const { shop, charge_id, plan } = req.query;

            if (!shop || typeof shop !== 'string') {
                return this.fail(res, "Missing shop parameter", 400);
            }

            if (charge_id && plan && typeof plan === 'string') {
                console.log(`Processing callback for shop: ${shop}, plan: ${plan}, charge_id: ${charge_id}`);
                // TODO: Verify HMAC and charge status with Shopify API for security
                const planDoc = await this.planService.getPlanByName(plan);
                if (planDoc) {
                    console.log(`Plan found: ${planDoc.name} (${planDoc._id}). Updating merchant...`);
                    const result = await this.merchantService.createOrUpdateMerchant({
                        shop: shop,
                        planId: planDoc._id
                    });
                    console.log(`Merchant update result:`, result);
                } else {
                    console.error(`Plan not found: ${plan}`);
                }
            }

            const shopName = shop.replace('.myshopify.com', '');
            const appUrl = `https://admin.shopify.com/store/${shopName}/apps/${env.SHOPIFY_API_KEY}/plans`; // Redirect back to plans page

            return res.redirect(appUrl);
        } catch (error) {
            return this.handleError(res, error);
        }
    }
}
