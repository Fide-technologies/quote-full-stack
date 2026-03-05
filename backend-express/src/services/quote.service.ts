import { injectable, inject } from "inversify";
import { TYPES, type IQuote, type QuoteDocument } from "@/types";
import type { IQuoteRepository } from "@/interfaces";
import { logger } from "@/utils/logger";
import type { IQuoteService, IMerchantService, IEmailService, IDraftOrderService, IUsageService } from "@/interfaces";
import type { Session } from "@shopify/shopify-api";
import mongoose from "mongoose";
import { shopify } from "@/config/shopify.config";

import type { PaginatedResult } from "@/interfaces";

import { QuoteStatus, ERROR_MESSAGES, SHOPIFY_DEFAULTS } from "@/constants";
import { GET_PRODUCTS_BY_IDS_QUERY } from "@/graphql/shopify-queries";

@injectable()
export class QuoteService implements IQuoteService {
    constructor(
        @inject(TYPES.IQuoteRepository) private readonly quoteRepository: IQuoteRepository,
        @inject(TYPES.IMerchantService) private readonly merchantService: IMerchantService,
        @inject(TYPES.IEmailService) private readonly emailService: IEmailService,
        @inject(TYPES.IDraftOrderService) private readonly draftOrderService: IDraftOrderService,
        @inject(TYPES.IUsageService) private readonly usageService: IUsageService
    ) { }

    async createQuote(shop: string, quoteData: any): Promise<QuoteDocument> {
        const merchant = await this.merchantService.getMerchantByShop(shop);
        if (!merchant) {
            throw new Error(ERROR_MESSAGES.MERCHANT.NOT_FOUND);
        }


        try {
            const price = Number(quoteData.price) || Number(quoteData.originalPrice) || 0;
            const quantity = Number(quoteData.quantity) || 1;

            const fullQuoteData: Partial<IQuote> = {
                shop,
                merchantId: merchant._id,

                // Customer Details
                firstName: quoteData.firstName,
                lastName: quoteData.lastName,
                customerName: `${quoteData.firstName || ""} ${quoteData.lastName || ""}`.trim(),
                customerEmail: quoteData.email,
                email: quoteData.email,
                phone: quoteData.phone,

                // Address Details
                address1: quoteData.address1,
                address2: quoteData.address2,
                city: quoteData.city,
                district: quoteData.district,
                state: quoteData.state,
                country: quoteData.country || quoteData.country_name || quoteData.country_code,
                pincode: quoteData.pincode,

                // Message
                customerMessage: quoteData.message,
                message: quoteData.message,

                // Product & Pricing
                productId: quoteData.productId,
                productTitle: quoteData.productTitle,
                variantId: quoteData.variantId ? String(quoteData.variantId) : undefined,
                originalPrice: mongoose.Types.Decimal128.fromString(price.toString()) as any,
                quantity: quantity,
                totalPrice: price * quantity,

                // Line Items
                items: quoteData.items || [
                    {
                        variantId: quoteData.variantId,
                        title: quoteData.productTitle,
                        quantity: quantity,
                        price: price
                    }
                ],
                customImages: quoteData.customImages || []
            };


            const quote = await this.quoteRepository.create(fullQuoteData);

            await this.usageService.incrementUsage(merchant._id.toString());

            this.emailService.sendQuoteNotification(shop, quote).catch(err => {
                logger.error(`[QuoteService] Asynchronous email notification failed:`, err);
            });

            return quote;
        } catch (error) {
            logger.error("Failed to create quote:", error);
            throw error;
        }
    }

    async getQuotesByMerchant(shop: string, page: number = 1, limit: number = 10, filters?: { q?: string; status?: string; date?: string; hasDraftOrder?: boolean }): Promise<PaginatedResult<QuoteDocument>> {
        return await this.quoteRepository.findByMerchant(shop, { page, limit }, filters);
    }

    async getEnrichedQuotesByMerchant(session: Session, page: number = 1, limit: number = 10, filters?: { q?: string; status?: string; date?: string; hasDraftOrder?: boolean }): Promise<PaginatedResult<QuoteDocument & { productDetails?: any }>> {
        const result = await this.quoteRepository.findByMerchant(session.shop, { page, limit }, filters);
        const quotes = result.data;

        const productIds = Array.from(new Set(quotes.map(q => q.productId).filter(Boolean)));
        let productMap: Record<string, any> = {};

        if (productIds.length > 0) {
            const validIds = productIds.map(id =>
                id && !id.startsWith('gid://') ? `${SHOPIFY_DEFAULTS.PRODUCT_GID_PREFIX}${id}` : id
            ).filter(Boolean);

            if (validIds.length > 0) {
                try {
                    const client = new shopify.api.clients.Graphql({ session });
                    const response = await client.request(
                        GET_PRODUCTS_BY_IDS_QUERY,
                        { variables: { ids: validIds } }
                    );

                    if (response.data && (response.data as any).nodes) {
                        (response.data as any).nodes.forEach((node: any) => {
                            if (node) {
                                // Map featuredMedia to featuredImage for backward compatibility
                                if (node.featuredMedia?.preview?.image) {
                                    node.featuredImage = node.featuredMedia.preview.image;
                                    delete node.featuredMedia; // Cleanup
                                }

                                const numericId = node.id.split('/').pop();
                                productMap[numericId] = node;
                                productMap[node.id] = node;
                            }
                        });
                    }
                } catch (error) {
                    logger.error("[QuoteService] Failed to fetch product details:", error);
                }
            }
        }

        const enrichedQuotes = quotes.map(quote => {
            const quoteObj = quote.toObject() as any;
            return {
                ...quoteObj,
                productDetails: productMap[quote.productId || ''] || null
            };
        });

        return {
            ...result,
            data: enrichedQuotes
        };
    }

    async updateQuoteStatus(id: string, status: IQuote["status"]): Promise<QuoteDocument | null> {
        return await this.quoteRepository.updateStatus(id, status);
    }

    async createDraftOrder(session: Session, quoteId: string): Promise<{ draftOrderId: string; invoiceUrl: string }> {
        try {
            // Fetch the quote
            const quote = await this.quoteRepository.findById(quoteId);
            if (!quote) {
                throw new Error(ERROR_MESSAGES.QUOTE.NOT_FOUND);
            }

            // Verify quote belongs to this shop
            if (quote.shop !== session.shop) {
                throw new Error(ERROR_MESSAGES.QUOTE.UNAUTHORIZED);
            }

            // Check if draft order already exists
            if (quote.draftOrderId) {
                logger.warn(`[QuoteService] ${ERROR_MESSAGES.QUOTE.DRAFT_ORDER_EXISTS(quoteId)}${quote.draftOrderId}`);
                return {
                    draftOrderId: quote.draftOrderId,
                    invoiceUrl: quote.draftOrderUrl || "",
                };
            }

            // Create draft order via Shopify API
            const result = await this.draftOrderService.createDraftOrderFromQuote(session, quote);

            // Update quote with draft order details
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
}
