import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { container } from '@/inversify.config';
import { TYPES } from '@/types';
import type { IMerchantService } from '@/interfaces';
import { Merchant } from '@/models/merchant.model';
import { Plan } from '@/models/plan.model';
import mongoose from 'mongoose';

describe('MerchantService Unit Tests', () => {
    let merchantService: IMerchantService;

    beforeAll(async () => {
        merchantService = container.get<IMerchantService>(TYPES.IMerchantService);
    });

    beforeEach(async () => {
        await Merchant.deleteMany({});
        await Plan.deleteMany({});

        // Seed a FREE plan (required for new merchant creation logic in the service)
        await Plan.create({
            name: "FREE",
            price: mongoose.Types.Decimal128.fromString("0"),
            quoteLimit: 10,
            billingReset: false,
            permissions: ["QUOTE_CREATE"],
            isActive: true
        });
    });

    it('should create a new merchant with default FREE plan', async () => {
        const shop = 'test-merchant.myshopify.com';
        await merchantService.createOrUpdateMerchant({
            shop,
            accessToken: 'dummy_token_123'
        });

        const saved = await Merchant.findOne({ shop }).populate('planId');
        expect(saved).not.toBeNull();
        expect(saved?.isActive).toBe(true);
        expect(saved?.accessToken).toBe('dummy_token_123');
        expect((saved?.planId as any).name).toBe('FREE');
    });

    it('should update an existing merchant when shop matches', async () => {
        const shop = 'update-me.myshopify.com';
        await Merchant.create({ shop, accessToken: 'old_token' });

        await merchantService.createOrUpdateMerchant({ shop, accessToken: 'new_token' });

        const updated = await Merchant.findOne({ shop });
        expect(updated?.accessToken).toBe('new_token');
    });

    it('should increment quote usage', async () => {
        const shop = 'usage.myshopify.com';
        await Merchant.create({
            shop,
            usage: { quotesUsed: 5 },
            accessToken: 'token'
        });

        const result = await merchantService.incrementQuoteUsage(shop, 10);
        expect(result?.usage?.quotesUsed).toBe(6);
    });

    it('should not increment if limit is reached', async () => {
        const shop = 'limit.myshopify.com';
        await Merchant.create({
            shop,
            usage: { quotesUsed: 10 },
            accessToken: 'token'
        });

        const result = await merchantService.incrementQuoteUsage(shop, 10);
        expect(result).toBeNull();
    });
});
