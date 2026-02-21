import { inject, injectable } from "inversify";
import { TYPES } from "@/types";
import type { ISettingsService, IPlanService } from "@/interfaces";
import type { Request, Response } from "express";
import { BaseController } from "./base.controller";
import { API_MESSAGES } from "@/constants/app.constants";

@injectable()
export class SettingsController extends BaseController {
    constructor(
        @inject(TYPES.ISettingsService) private settingsService: ISettingsService,
        @inject(TYPES.IPlanService) private planService: IPlanService
    ) {
        super();
    }

    public getSettings = async (req: Request, res: Response) => {
        try {
            const session = res.locals.shopify.session;

            await this.settingsService.ensureMetafieldDefinitions(session);

            const settings = await this.settingsService.getSettings(session);
            const plan = await this.planService.getMerchantPlan(session.shop);

            // Append plan information to settings response
            const settingsWithPlan = {
                ...settings,
                plan: plan?.name
            };

            return this.ok(res, settingsWithPlan, API_MESSAGES.SETTINGS.RETRIEVED);
        } catch (error) {
            return this.handleError(res, error, API_MESSAGES.SETTINGS.FAILED_RETRIEVE);
        }
    };

    public updateSettings = async (req: Request, res: Response) => {
        try {
            const session = res.locals.shopify.session;
            const { showOnAll } = req.body;
            console.log("[SettingsController] updateSettings body:", req.body, "showOnAll:", showOnAll, "Type:", typeof showOnAll);

            await this.settingsService.updateSettings(session, { showOnAll });

            return this.ok(res, { success: true }, API_MESSAGES.SETTINGS.UPDATED);
        } catch (error) {
            return this.handleError(res, error, API_MESSAGES.SETTINGS.FAILED_UPDATE);
        }
    };
}
