import { inject, injectable } from "inversify";
import { TYPES } from "@/types";
import type { IDashboardService } from "@/interfaces";
import type { Request, Response } from "express";
import { BaseController } from "./base.controller";
import { API_MESSAGES, CONTROLLER } from "@/constants";

@injectable()
export class DashboardController extends BaseController {
    constructor(
        @inject(TYPES.IDashboardService) private dashboardService: IDashboardService
    ) {
        super();
    }

    public getStats = async (req: Request, res: Response) => {
        try {
            const session = res.locals.shopify?.session;

            if (!session) {
                return this.handleError(res, new Error(CONTROLLER.AUTH_FAILED), CONTROLLER.AUTH_FAILED);
            }

            const stats = await this.dashboardService.getStats(session);

            return this.ok(
                res,
                stats,
                "Dashboard stats retrieved successfully"
            );
        } catch (error) {
            return this.handleError(res, error, "Failed to retrieve dashboard stats");
        }
    };
}
