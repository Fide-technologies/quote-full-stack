import type { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { BaseController } from "./base.controller";
import { TYPES } from "@/types";
import type { IPlanService, IMerchantService } from "@/interfaces";


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
            const { shop, charge_id, plan } = req.query as { shop: string; charge_id?: string; plan?: string };
            const appUrl = await this.planService.handleCallback(shop, charge_id, plan);
            return res.redirect(appUrl);
        } catch (error) {
            return this.handleError(res, error);
        }
    }
}
