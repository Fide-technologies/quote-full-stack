import { shopify } from "@/config/shopify.config";
import type { IMerchantService, IPlanService } from "@/interfaces";
import { type ShopifyShopResponse, TYPES } from "@/types";
import { logger } from "@/utils/logger";
import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";

@injectable()
export class AuthController {
    constructor(
        @inject(TYPES.IMerchantService) private merchantService: IMerchantService,
        @inject(TYPES.IPlanService) private planService: IPlanService,
    ) {}

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
            // This is handled in the PlanService following our service-layer rules.
            const billingState = await this.planService.verifyReinstallationBilling(session);

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
