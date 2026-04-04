import { shopify } from "@/config/shopify.config";
import { APP_DEFAULTS, ERROR_MESSAGES } from "@/constants";
import { CREATE_DRAFT_ORDER_MUTATION_MINIMAL } from "@/graphql/quotes";
import { GET_SHOP_CURRENCY_QUERY } from "@/graphql/shopify-queries";
import type { IDraftOrderService, IMerchantService } from "@/interfaces";
import type { DraftOrderMapper } from "@/mappers/draft-order.mapper";
import { TYPES, type DraftOrderCreateResponse, type QuoteDocument, type ShopifyShopCurrencyResponse } from "@/types";
import { logger } from "@/utils/logger";
import { validateQuoteForDraftOrder } from "@/validations/draft-order.validation";
import type { Session } from "@shopify/shopify-api";
import { inject, injectable } from "inversify";

@injectable()
export class DraftOrderService implements IDraftOrderService {
    constructor(
        @inject(TYPES.DraftOrderMapper) private readonly mapper: DraftOrderMapper,
        @inject(TYPES.IMerchantService) private readonly merchantService: IMerchantService,
    ) {}

    async createDraftOrderFromQuote(
        session: Session,
        quote: QuoteDocument,
    ): Promise<{ draftOrderId: string; invoiceUrl: string }> {
        try {
            // 1. Validate Quote

            validateQuoteForDraftOrder(quote);

            const client = new shopify.api.clients.Graphql({ session });

            // 2. Performance: Fetch Shop Currency from DB first
            let currencyCode = APP_DEFAULTS.CURRENCY_CODE;
            const merchant = await this.merchantService.getMerchantByShop(session.shop);

            if (merchant?.currency) {
                currencyCode = merchant.currency;
            } else {
                const shopResponse = await client.request<ShopifyShopCurrencyResponse>(GET_SHOP_CURRENCY_QUERY);
                currencyCode = shopResponse.data?.shop?.currencyCode || APP_DEFAULTS.CURRENCY_CODE;

                if (merchant) {
                    this.merchantService
                        .createOrUpdateMerchant({
                            shop: session.shop,
                            currency: currencyCode,
                        })
                        .catch((err: unknown) =>
                            logger.error(`[DraftOrderService] ${ERROR_MESSAGES.MERCHANT.CURRENCY_CACHE_FAILED}`, err),
                        );
                }
            }

            const input = this.mapper.toDraftOrderInput(quote, currencyCode);

            logger.info("[DraftOrderService] Preparing draft order", {
                quoteId: quote._id,
                variantId: input.lineItems?.[0]?.variantId,
                lineItemsCount: input.lineItems?.length,
            });

            // 4. Create Draft Order
            const response = await client.request<DraftOrderCreateResponse>(CREATE_DRAFT_ORDER_MUTATION_MINIMAL, {
                variables: { input },
            });

            console.log("response ", response.data?.draftOrderCreate);

            if (!response.data) {
                throw new Error(ERROR_MESSAGES.DRAFT_ORDER.API_NO_DATA);
            }

            const { draftOrder, userErrors } = response.data.draftOrderCreate;

            if (userErrors && userErrors.length > 0) {
                const errorMessages = userErrors
                    .map((e: { field?: string[]; message: string }) => `${e.field?.join(".")}: ${e.message}`)
                    .join(", ");
                logger.error("[DraftOrderService] Draft order creation failed:", userErrors);
                throw new Error(`${ERROR_MESSAGES.DRAFT_ORDER.CREATION_FAILED}: ${errorMessages}`);
            }

            if (!draftOrder) {
                throw new Error(ERROR_MESSAGES.DRAFT_ORDER.CREATION_NULL);
            }

            logger.info(`[DraftOrderService] Draft order created successfully: ${draftOrder.id}`);

            return {
                draftOrderId: draftOrder.id,
                invoiceUrl: draftOrder.invoiceUrl,
            };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            logger.error(`[DraftOrderService] Error creating draft order: ${message}`);
            throw error;
        }
    }

    async checkDraftOrderExists(session: Session, draftOrderId: string): Promise<boolean> {
        try {
            const client = new shopify.api.clients.Graphql({ session });
            const gid = draftOrderId.startsWith("gid://") ? draftOrderId : `gid://shopify/DraftOrder/${draftOrderId}`;

            const response = await client.request<unknown>(
                `query getDraftOrder($id: ID!) {
                    draftOrder(id: $id) {
                        id
                    }
                }`,
                { variables: { id: gid } },
            );

            const data = response.data as { draftOrder?: { id: string } };
            return !!data?.draftOrder;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            logger.error(`[DraftOrderService] Error checking draft order existence: ${message}`);
            // If it's a "Not Found" error from Shopify, we can treat it as doesn't exist
            return false;
        }
    }
}
