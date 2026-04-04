import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { container } from '@/inversify.config';
import { TYPES } from '@/types/types';
import type { IQuoteService } from '@/interfaces';
import { Quote } from '@/models/quote.model';
import { Merchant } from '@/models/merchant.model';
import mongoose from 'mongoose';

describe('QuoteService Unit Tests', () => {
    let quoteService: IQuoteService;

    beforeAll(async () => {
        quoteService = container.get<IQuoteService>(TYPES.IQuoteService);
    });

    beforeEach(async () => {
        await Quote.deleteMany({});
        await Merchant.deleteMany({});
    });

    it('should create a quote and associate it with a merchant', async () => {
        const shop = 'test-shop.myshopify.com';
        const merchant = await Merchant.create({
            shop,
            accessToken: 'token',
            email: 'test@shop.com'
        });

        const quoteData = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@customer.com',
            productId: '123456',
            productTitle: 'Test Product',
            price: 100,
            quantity: 2
        };

        const quote = await quoteService.createQuote(shop, quoteData);

        expect(quote).toBeDefined();
        expect(quote.customerName).toBe('John Doe');
        expect(Number(quote.totalPrice.toString())).toBe(200);
        expect(quote.shop).toBe(shop);
        expect(quote.merchantId.toString()).toBe(merchant._id.toString());
    });

    it('should throw error if merchant is not found', async () => {
        const quoteData = { email: 'test@example.com' };
        await expect(quoteService.createQuote('non-existent.shop', quoteData)).rejects.toThrow();
    });

    it('should update quote status', async () => {
        const merchant = await Merchant.create({ shop: 'test.shop', accessToken: 't' });

        // Correcting manually created quote with all required fields
        const quote = await Quote.create({
            shop: 'test.shop',
            merchantId: merchant._id,
            customerEmail: 'test@example.com',
            originalPrice: mongoose.Types.Decimal128.fromString("10.0"),
            totalPrice: 10,
            quantity: 1,
            items: [],
            status: 'PENDING'
        });

        const updated = await quoteService.updateQuoteStatus(quote._id.toString(), 'APPROVED' as any);
        expect(updated?.status).toBe('APPROVED');
    });

    it('should retrieve quotes for a merchant', async () => {
        const shop = 'list.shop';
        const merchant = await Merchant.create({ shop, accessToken: 't' });

        const baseQuote = {
            shop,
            merchantId: merchant._id,
            originalPrice: mongoose.Types.Decimal128.fromString("10.0"),
            totalPrice: 10,
            quantity: 1,
            items: [],
            status: 'PENDING'
        };

        await Quote.create([
            { ...baseQuote, customerEmail: 'a@a.com' },
            { ...baseQuote, customerEmail: 'b@b.com' }
        ]);

        const results = await quoteService.getQuotesByMerchant(shop, 1, 10);
        expect(results.data.length).toBe(2);
        expect(results.total).toBe(2);
    });
});
