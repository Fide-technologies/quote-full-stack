import { inject, injectable } from "inversify";
import { TYPES } from "@/types";
import type { IMerchantService } from "@/interfaces";
import { shopify } from "@/config";
import { logger } from "@/utils/logger";
import type { Request, Response, NextFunction } from "express";

@injectable()
export class AuthController {
    constructor(
        @inject(TYPES.IMerchantService) private merchantService: IMerchantService
    ) { }

    callbackStore = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const session = res.locals.shopify.session;
            const client = new shopify.api.clients.Rest({ session });
            const shopResponse = await client.get({ path: "shop" });

            interface Shop {
                email: string;
                shop_owner: string;
                currency: string;
            }

            const shopData = (shopResponse.body as { shop: Shop })?.shop;

            if (!shopData) {
                logger.error(`Auth Callback: Failed to fetch shop data for ${session.shop}`);
                return res.status(500).send("Failed to fetch shop details from Shopify");
            }

            await this.merchantService.createOrUpdateMerchant({
                shop: session.shop,
                accessToken: session.accessToken,
                scopes: session.scope,
                email: shopData.email,
                shopOwner: shopData.shop_owner,
                currency: shopData.currency,
                isActive: true,
                installedAt: new Date(),
            });

            await shopify.api.webhooks.register({ session });

            next();
        } catch (error) {
            next(error);
        }
    }
}
