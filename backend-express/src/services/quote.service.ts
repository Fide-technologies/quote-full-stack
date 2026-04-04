import { shopify } from "@/config/shopify.config";
import type { IQuoteRepository } from "@/interfaces";
import type { IDraftOrderService, IEmailService, IMerchantService, IQuoteService, IUsageService } from "@/interfaces";
import { type IQuote, type QuoteDocument, TYPES } from "@/types";
import { logger } from "@/utils/logger";
import type { Session } from "@shopify/shopify-api";
import { inject, injectable } from "inversify";
import mongoose from "mongoose";

import type { PaginatedResult } from "@/interfaces";

import { ERROR_MESSAGES, QuoteStatus, SHOPIFY_DEFAULTS } from "@/constants";
import { GET_PRODUCTS_BY_IDS_QUERY } from "@/graphql/shopify-queries";

interface ShopifyGraphqlResponse {
    data?: {
        nodes?: Array<{
            id: string;
            featuredMedia?: { preview?: { image?: unknown } };
            featuredImage?: unknown;
            [key: string]: unknown;
        }>;
    };
}

@injectable()
export class QuoteService implements IQuoteService {
    constructor(
        @inject(TYPES.IQuoteRepository) private readonly quoteRepository: IQuoteRepository,
        @inject(TYPES.IMerchantService) private readonly merchantService: IMerchantService,
        @inject(TYPES.IEmailService) private readonly emailService: IEmailService,
        @inject(TYPES.IDraftOrderService) private readonly draftOrderService: IDraftOrderService,
        @inject(TYPES.IUsageService) private readonly usageService: IUsageService,
    ) {}

    async createQuote(shop: string, quoteDataInput: Record<string, unknown>): Promise<QuoteDocument> {
        const merchant = await this.merchantService.getMerchantByShop(shop);
        if (!merchant) {
            throw new Error(ERROR_MESSAGES.MERCHANT.NOT_FOUND);
        }

        try {
            // Extract with defaults for optional values
            const price = Number(quoteDataInput.price || quoteDataInput.originalPrice) || 0;
            const quantity = Number(quoteDataInput.quantity) || 1;

            const fullQuoteData: Partial<IQuote> = {
                shop,
                merchantId: merchant._id,

                // Customer Details
                firstName: String(quoteDataInput.firstName || ""),
                lastName: String(quoteDataInput.lastName || ""),
                customerName: `${quoteDataInput.firstName || ""} ${quoteDataInput.lastName || ""}`.trim(),
                customerEmail: String(quoteDataInput.email || ""),
                email: String(quoteDataInput.email || ""),
                phone: String(quoteDataInput.phone || ""),

                // Address Details
                address1: String(quoteDataInput.address1 || ""),
                address2: String(quoteDataInput.address2 || ""),
                city: String(quoteDataInput.city || ""),
                district: String(quoteDataInput.district || ""),
                state: String(quoteDataInput.state || ""),
                country: String(
                    quoteDataInput.country || quoteDataInput.country_name || quoteDataInput.country_code || "",
                ),
                pincode: String(quoteDataInput.pincode || ""),

                // Message
                customerMessage: String(quoteDataInput.message || ""),
                message: String(quoteDataInput.message || ""),

                // Product & Pricing
                productId: String(quoteDataInput.productId || ""),
                productTitle: String(quoteDataInput.productTitle || ""),
                variantId: quoteDataInput.variantId ? String(quoteDataInput.variantId) : undefined,
                originalPrice: mongoose.Types.Decimal128.fromString(price.toString()),
                quantity: quantity,
                totalPrice: price * quantity,

                // Line Items
                items: (quoteDataInput.items as IQuote["items"]) || [
                    {
                        variantId: quoteDataInput.variantId ? String(quoteDataInput.variantId) : undefined,
                        title: String(quoteDataInput.productTitle || ""),
                        quantity: quantity,
                        price: price,
                    },
                ],
                customData: (quoteDataInput.customData as Record<string, unknown>) || {},
                customImages: (quoteDataInput.customImages as string[]) || [],
            };

            const quote = await this.quoteRepository.create(fullQuoteData);

            // Increment usage asynchronously
            this.usageService.incrementUsage(merchant._id.toString()).catch((err) => {
                logger.error(`[QuoteService] Failed to increment usage for merchant ${merchant._id}:`, err);
            });

            // Send notification asynchronously
            this.emailService.sendQuoteNotification(shop, quote).catch((err) => {
                logger.error("[QuoteService] Asynchronous email notification failed:", err);
            });

            return quote;
        } catch (error) {
            logger.error(`[QuoteService] Failed to create quote for shop ${shop}:`, error);
            throw error;
        }
    }

    async getQuotesByMerchant(
        shop: string,
        page = 1,
        limit = 10,
        filters?: { q?: string; status?: string; date?: string; hasDraftOrder?: boolean },
    ): Promise<PaginatedResult<QuoteDocument>> {
        return await this.quoteRepository.findByMerchant(shop, { page, limit }, filters);
    }

    async getEnrichedQuotesByMerchant(
        session: Session,
        page = 1,
        limit = 10,
        filters?: { q?: string; status?: string; date?: string; hasDraftOrder?: boolean },
    ): Promise<PaginatedResult<QuoteDocument & { productDetails?: unknown }>> {
        const result = await this.quoteRepository.findByMerchant(session.shop, { page, limit }, filters);
        const quotes = result.data;

        const productIds = Array.from(new Set(quotes.map((q) => q.productId).filter(Boolean)));
        const productMap: Record<string, unknown> = {};

        if (productIds.length > 0) {
            const validIds = productIds
                .map((id) => (id && !id.startsWith("gid://") ? `${SHOPIFY_DEFAULTS.PRODUCT_GID_PREFIX}${id}` : id))
                .filter(Boolean);

            if (validIds.length > 0) {
                try {
                    const client = new shopify.api.clients.Graphql({ session });
                    const response = (await client.request(GET_PRODUCTS_BY_IDS_QUERY, {
                        variables: { ids: validIds },
                    })) as ShopifyGraphqlResponse;

                    if (response.data?.nodes) {
                        for (const node of response.data.nodes) {
                            if (node) {
                                const featuredImage = node.featuredMedia?.preview?.image || node.featuredImage;
                                const updatedNode = {
                                    ...node,
                                    featuredImage,
                                    featuredMedia: undefined,
                                };

                                const numericId = node.id.split("/").pop();
                                if (numericId) {
                                    productMap[numericId] = updatedNode;
                                }
                                productMap[node.id] = updatedNode;
                            }
                        }
                    }
                } catch (error) {
                    logger.error("[QuoteService] Failed to fetch product details:", error);
                }
            }
        }

        const enrichedQuotes = quotes.map((quote) => {
            const quoteObj = quote.toObject() as unknown as IQuote;
            return {
                ...quoteObj,
                productDetails: productMap[quote.productId || ""] || null,
            } as QuoteDocument & { productDetails?: unknown };
        });

        return {
            ...result,
            data: enrichedQuotes,
        };
    }

    async updateQuoteStatus(id: string, status: IQuote["status"]): Promise<QuoteDocument | null> {
        return await this.quoteRepository.updateStatus(id, status);
    }

    async createDraftOrder(session: Session, quoteId: string): Promise<{ draftOrderId: string; invoiceUrl: string }> {
        try {
            const quote = await this.quoteRepository.findById(quoteId);
            if (!quote) {
                throw new Error(ERROR_MESSAGES.QUOTE.NOT_FOUND);
            }

            if (quote.shop !== session.shop) {
                throw new Error(ERROR_MESSAGES.QUOTE.UNAUTHORIZED);
            }

            if (quote.draftOrderId) {
                logger.warn(`[QuoteService] ${ERROR_MESSAGES.QUOTE.DRAFT_ORDER_EXISTS(quoteId)}${quote.draftOrderId}`);
                return {
                    draftOrderId: quote.draftOrderId,
                    invoiceUrl: quote.draftOrderUrl || "",
                };
            }

            const result = await this.draftOrderService.createDraftOrderFromQuote(session, quote);

            quote.draftOrderId = result.draftOrderId;
            quote.draftOrderUrl = result.invoiceUrl;
            quote.status = QuoteStatus.APPROVED;
            await quote.save();

            logger.info(`[QuoteService] ${ERROR_MESSAGES.QUOTE.DRAFT_CREATED(quoteId)}`);

            return result;
        } catch (error) {
            logger.error(`[QuoteService] ${ERROR_MESSAGES.DRAFT_ORDER.CREATION_FAILED}:`, error);
            throw error;
        }
    }

    async getQuoteById(session: Session, id: string): Promise<(QuoteDocument & { productDetails?: unknown }) | null> {
        const quote = await this.quoteRepository.findById(id);

        if (!quote) {
            return null;
        }

        if (quote.shop !== session.shop) {
            throw new Error(ERROR_MESSAGES.QUOTE.UNAUTHORIZED);
        }

        if (quote.draftOrderId) {
            try {
                const exists = await this.draftOrderService.checkDraftOrderExists(session, quote.draftOrderId);
                if (!exists) {
                    logger.warn(
                        `[QuoteService] Draft Order ${quote.draftOrderId} not found on Shopify for quote ${id}. Resetting quote details.`,
                    );
                    quote.draftOrderId = undefined;
                    quote.draftOrderUrl = undefined;
                    if (quote.status === QuoteStatus.APPROVED) {
                        quote.status = QuoteStatus.PENDING;
                    }
                    await quote.save();
                }
            } catch (err) {
                logger.error(`[QuoteService] Failed to verify draft order existence for quote ${id}:`, err);
            }
        }

        let productDetails: unknown = null;
        const productId = quote.productId;
        if (productId) {
            try {
                const gid = productId.startsWith("gid://")
                    ? productId
                    : `${SHOPIFY_DEFAULTS.PRODUCT_GID_PREFIX}${productId}`;
                const client = new shopify.api.clients.Graphql({ session });
                const response = (await client.request(GET_PRODUCTS_BY_IDS_QUERY, {
                    variables: { ids: [gid] },
                })) as ShopifyGraphqlResponse;

                if (response.data?.nodes && response.data.nodes.length > 0) {
                    const node = response.data.nodes[0];
                    if (node) {
                        const featuredImage = node.featuredMedia?.preview?.image || node.featuredImage;
                        productDetails = {
                            ...node,
                            featuredImage,
                            featuredMedia: undefined,
                        };
                    }
                }
            } catch (error) {
                logger.error(`[QuoteService] Failed to fetch product details for quote ${id}:`, error);
            }
        }

        const quoteObj = quote.toObject() as unknown as IQuote;
        return {
            ...quoteObj,
            productDetails,
        } as QuoteDocument & { productDetails?: unknown };
    }

    async redactCustomerData(email: string): Promise<void> {
        await this.quoteRepository.redactByCustomerEmail(email);
    }
}
