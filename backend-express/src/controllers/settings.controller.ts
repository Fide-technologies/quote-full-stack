import { API_MESSAGES } from "@/constants/app.constants";
import type { IPlanService, ISettingsService } from "@/interfaces";
import { TYPES } from "@/types";
import type { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { BaseController } from "./base.controller";

@injectable()
export class SettingsController extends BaseController {
    constructor(
        @inject(TYPES.ISettingsService) private settingsService: ISettingsService,
        @inject(TYPES.IPlanService) private planService: IPlanService,
    ) {
        super();
    }

    public getSettings = async (req: Request, res: Response) => {
        try {
            const session = res.locals.shopify.session;

            await this.settingsService.ensureMetafieldDefinitions(session);

            const settings = await this.settingsService.getSettings(session);
            const plan = await this.planService.getMerchantPlan(session.shop);
            const themeAudit = await this.settingsService.checkAppEmbedStatus(session);

            // Append plan and connectivity information to settings response
            const settingsExtended = {
                ...settings,
                plan: plan?.name,
                isAppEmbedded: themeAudit.isEmbedded,
                deepLinkUrl: themeAudit.themeId
                    ? `https://admin.shopify.com/store/${session.shop.split(".")[0]}/themes/${themeAudit.themeId}/editor?context=apps`
                    : "shopify:admin/themes/current/editor?context=apps",
            };

            return this.ok(res, settingsExtended, API_MESSAGES.SETTINGS.RETRIEVED);
        } catch (error) {
            return this.handleError(res, error, API_MESSAGES.SETTINGS.FAILED_RETRIEVE);
        }
    };

    public updateSettings = async (req: Request, res: Response) => {
        try {
            const session = res.locals.shopify.session;
            console.log("[SettingsController] updateSettings body:", req.body);

            await this.settingsService.updateSettings(session, req.body);

            return this.ok(res, { success: true }, API_MESSAGES.SETTINGS.UPDATED);
        } catch (error) {
            return this.handleError(res, error, API_MESSAGES.SETTINGS.FAILED_UPDATE);
        }
    };
}
