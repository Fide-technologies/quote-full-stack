import type { IEmailConfigService } from "@/interfaces";
import { TYPES } from "@/types";
import type { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { BaseController } from "./base.controller";

@injectable()
export class EmailConfigController extends BaseController {
    constructor(
        @inject(TYPES.IEmailConfigService) private emailConfigService: IEmailConfigService,
    ) {
        super();
    }

    public getConfig = async (req: Request, res: Response) => {
        try {
            const session = res.locals.shopify.session;
            const config = await this.emailConfigService.getConfig(session);
            return this.ok(res, config, "Email configuration retrieved successfully");
        } catch (error) {
            return this.handleError(res, error, "Failed to retrieve email configuration");
        }
    };

    public updateConfig = async (req: Request, res: Response) => {
        try {
            const session = res.locals.shopify.session;
            await this.emailConfigService.updateConfig(session, req.body);
            return this.ok(res, { success: true }, "Email configuration updated successfully");
        } catch (error) {
            return this.handleError(res, error, "Failed to update email configuration");
        }
    };

    public testSmtp = async (req: Request, res: Response) => {
        try {
            const session = res.locals.shopify.session;
            const success = await this.emailConfigService.testConnection(session, req.body);

            if (success) {
                return this.ok(res, { success: true }, "SMTP connection successful. Test email sent.");
            }

            return this.handleError(res, new Error("SMTP verification failed"), "Failed to connect to SMTP server");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "SMTP test failed";
            return this.handleError(res, error, message);
        }
    };

    public getSmtpProviders = async (req: Request, res: Response) => {
        try {
            const providers = await this.emailConfigService.getSmtpProviders();
            return this.ok(res, providers, "SMTP providers retrieved");
        } catch (error) {
            return this.handleError(res, error, "Failed to retrieve SMTP providers");
        }
    };
}
