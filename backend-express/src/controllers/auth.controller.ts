import { shopify } from "@/config/shopify.config";
import type { IMerchantService, IPlanService } from "@/interfaces";
import { type ShopifyShopResponse, TYPES } from "@/types";
import { SubscriptionStatus } from "@/constants";
import { env } from "@/validations/env.validation";
import { logger } from "@/utils/logger";
import type { Types } from "mongoose";
import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";

@injectable()
export class AuthController {
    constructor(
        @inject(TYPES.IMerchantService) private merchantService: IMerchantService,
        @inject(TYPES.IPlanService) private planService: IPlanService,
    ) { }

    callbackStore = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const callbackResponse = await shopify.api.auth.callback({
                rawRequest: req,
                rawResponse: res,
            });

            const { session } = callbackResponse;
            if (!session || !session.accessToken) {
                return res.status(500).send("No session found in callback");
            }

            const client = new shopify.api.clients.Rest({ session });
            const shopData = (await client.get({ path: "shop" })) as unknown as { body: ShopifyShopResponse };

            if (!shopData?.body?.shop) {
                return res.status(500).send("Failed to fetch shop details from Shopify");
            }

            const shopInfo = shopData.body.shop;

            // 3. Fetch current billing status from Shopify (Managed Billing)
            // We only do this if the app is configured as a paid app to avoid 403 errors on the Free tier.
            let billingState: { planId?: Types.ObjectId; subscriptionStatus?: SubscriptionStatus } = {
                subscriptionStatus: SubscriptionStatus.ACTIVE // Default for free app
            };

            if (env.IS_PAID_APP === "true") {
                const fetchedBilling = await this.planService.verifyReinstallationBilling(session);
                billingState = { ...billingState, ...fetchedBilling };
            }

            await this.merchantService.createOrUpdateMerchant({
                shop: session.shop,
                accessToken: session.accessToken,
                scopes: session.scope,
                email: shopInfo.email,
                shopOwner: shopInfo.shop_owner,
                currency: shopInfo.currency,
                isActive: true,
                installedAt: new Date(),
                ...billingState,
            });

            await shopify.api.webhooks.register({ session });

            return res.redirect(`/api/auth?shop=${session.shop}&host=${req.query.host}`);
        } catch (error) {
            logger.error(`Error in callbackStore: ${error}`);
            next(error);
        }
    };
}
