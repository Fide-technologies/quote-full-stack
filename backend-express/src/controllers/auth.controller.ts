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
                expiring: true
            });

            const { session } = callbackResponse;

            if (!session || !session.accessToken) {
                return res.status(500).send("No session found in callback");
            }

            // Manually store the session since we took over the callback logic
            await shopify.config.sessionStorage.storeSession(session);

            res.locals.shopify = {
                ...res.locals.shopify,
                session,
            };

            const client = new shopify.api.clients.Rest({ session });
            const shopData = (await client.get({ path: "shop" })) as unknown as { body: ShopifyShopResponse };

            if (!shopData?.body?.shop) {
                return res.status(500).send("Failed to fetch shop details from Shopify");
            }

            const shopInfo = shopData.body.shop;

            // Setting default ACTIVE status for the free version.
            // This bypasses the billing API check and prevents 403 Forbidden errors.
            const subscriptionStatus = SubscriptionStatus.ACTIVE;

            await this.merchantService.createOrUpdateMerchant({
                shop: session.shop,
                accessToken: session.accessToken,
                name: shopInfo.name,
                scopes: session.scope,
                email: shopInfo.email,
                shopOwner: shopInfo.shop_owner,
                currency: shopInfo.currency,
                isActive: true,
                installedAt: new Date(),
                subscriptionStatus,
            });

            await shopify.api.webhooks.register({ session });

            // Pass control to the next middleware (shopify.redirectToShopifyOrAppRoot)
            next();
        } catch (error) {
            logger.error(`Error in callbackStore: ${error}`);
            next(error);
        }
    };
}
