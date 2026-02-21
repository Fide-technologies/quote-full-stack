import { inject, injectable } from "inversify";
import { TYPES } from "@/types";
import type { IMerchantService } from "@/interfaces";
import { shopify } from "@/config";
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

            const shop = (shopResponse.body as { shop: Shop }).shop;


            await this.merchantService.createOrUpdateMerchant({
                shop: session.shop,
                accessToken: session.accessToken,
                scopes: session.scope,
                email: shop.email,
                shopOwner: shop.shop_owner,
                currency: shop.currency,
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
