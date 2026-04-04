import type { Request, Response, NextFunction } from "express";
import { container } from "@/inversify.config";
import { TYPES } from "@/types/types";
import type { IUsageService } from "@/interfaces/services/IUsageService";
import { logger } from "@/utils/logger";
import { PlanAction, PlanType } from "@/constants/plan.constants";
import { SubscriptionStatus } from "@/constants/merchant.constants";
import { env } from "@/validations/env.validation";

export const planGuard = (requiredPermission?: PlanAction | string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const usageService = container.get<IUsageService>(TYPES.IUsageService);

            const shop = req.shopify?.shop || res.locals.shopify?.session?.shop;

            if (!shop) {
                logger.warn("PlanGuard: No shop found in request context");
                return res.status(401).json({ error: "Unauthorized: No shop context found" });
            }

            const { merchant, plan } = await usageService.getMerchantPlanAndUsage(shop);

            // 0. Check Merchant Status (EXPIRE/UNINSTALLED EDGE CASES)
            if (!merchant.isActive) {
                logger.warn(`PlanGuard: Merchant is inactive. Shop: ${shop}`);
                return res.status(403).json({
                    error: "Your account is inactive. Please reinstall the app or contact support.",
                    code: "MERCHANT_INACTIVE"
                });
            }

            const isPaidApp = env.IS_PAID_APP === "true";

            // Check if subscription has expired or is not active
            // Note: SubscriptionStatus.ACTIVE and SubscriptionStatus.TRIAL are considered valid.
            // "FREE" plan usually doesn't have an active recurring subscription in Shopify, 
            // but our DB stores its planId correctly.
            const isFreePlan = plan.name === PlanType.FREE;
            const hasActiveSubscription = merchant.subscriptionStatus === SubscriptionStatus.ACTIVE || 
                                        merchant.subscriptionStatus === SubscriptionStatus.TRIAL;

            if (isPaidApp && !isFreePlan && !hasActiveSubscription) {
                logger.warn(`PlanGuard: Subscription expired or inactive. Shop: ${shop}, Status: ${merchant.subscriptionStatus}`);
                return res.status(402).json({
                    error: "Subscription required. Please upgrade your plan.",
                    code: "SUBSCRIPTION_REQUIRED",
                    status: merchant.subscriptionStatus
                });
            }

            // 1. Check Permissions
            if (isPaidApp && requiredPermission) {
                if (!plan.permissions.includes(requiredPermission as string)) {
                    logger.warn(`PlanGuard: Permission denied. Shop: ${shop}, Required: ${requiredPermission}, Plan: ${plan.name}`);
                    logger.warn(`PlanGuard: Current Permissions: ${JSON.stringify(plan.permissions)}`); // Added log
                    return res.status(403).json({
                        error: "Forbidden: Your plan does not allow this action.",
                        action: requiredPermission,
                        plan: plan.name,
                        required: requiredPermission, // Helpful for frontend debugging
                        currentPermissions: plan.permissions // Helpful for frontend debugging
                    });
                }
            }

            // 2. Check Quota (for quote creation)
            if (requiredPermission === PlanAction.QUOTE_CREATE) {
                const withinQuota = await usageService.checkQuota(merchant._id.toString());
                
                if (!isPaidApp) {
                    if (merchant.usage.quotesUsed >= 10000) {
                        logger.warn(`PlanGuard: Free mode quota exceeded. Shop: ${shop}, Used: ${merchant.usage.quotesUsed}`);
                        return res.status(403).json({
                            error: "Monthly free quota exceeded. Please contact support to increase your limits.",
                            limit: 10000,
                            used: merchant.usage.quotesUsed
                        });
                    }
                } else if (!withinQuota) {
                    logger.warn(`PlanGuard: Quota exceeded. Shop: ${shop}, Limit: ${plan.quoteLimit}, Used: ${merchant.usage.quotesUsed}`);
                    return res.status(403).json({
                        error: "Quota exceeded. Please upgrade your plan.",
                        limit: plan.quoteLimit,
                        used: merchant.usage.quotesUsed
                    });
                }
            }

            // Optional: Attach merchant/plan to request for controller use
            // req.merchantId = merchant._id.toString();

            next();
        } catch (error) {
            logger.error("PlanGuard Error:", error);
            // Handle specific errors like Merchant/Plan not found
            const msg = error instanceof Error ? error.message : "Unknown error";
            if (msg.includes("Merchant not found") || msg.includes("Plan not found")) {
                return res.status(400).json({ error: msg });
            }
            return res.status(500).json({ error: "Internal Server Error during plan check" });
        }
    };
};
