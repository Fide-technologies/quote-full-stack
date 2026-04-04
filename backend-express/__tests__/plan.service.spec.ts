import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { container } from '@/inversify.config';
import { TYPES } from '@/types';
import type { IPlanService, IMerchantService } from '@/interfaces';
import { Merchant } from '@/models/merchant.model';
import { Plan } from '@/models/plan.model';
import mongoose from 'mongoose';

describe('PlanService Unit Tests', () => {
    let planService: IPlanService;
    let merchantService: IMerchantService;

    beforeAll(async () => {
        planService = container.get<IPlanService>(TYPES.IPlanService);
        merchantService = container.get<IMerchantService>(TYPES.IMerchantService);
    });

    beforeEach(async () => {
        await Merchant.deleteMany({});
        await Plan.deleteMany({});

        // Seed default plans correctly according to the strict schema
        await Plan.create({
            name: "FREE",
            price: mongoose.Types.Decimal128.fromString("0"),
            quoteLimit: 5,
            billingReset: false,
            permissions: ["QUOTE_CREATE", "QUOTE_READ"],
            isActive: true
        });

        await Plan.create({
            name: "PRO",
            price: mongoose.Types.Decimal128.fromString("19.99"),
            quoteLimit: 100,
            billingReset: true,
            permissions: ["QUOTE_CREATE", "QUOTE_READ", "QUOTE_UPDATE", "REMOVE_BRANDING"],
            isActive: true
        });
    });

    it('should correctly determine merchant current plan', async () => {
        const freePlan = await Plan.findOne({ name: "FREE" });
        await Merchant.create({
            shop: 'free-shop.myshopify.com',
            accessToken: 't',
            planId: freePlan?._id
        });

        const currentPlan = await planService.getMerchantPlan('free-shop.myshopify.com');
        expect(currentPlan?.name).toBe('FREE');
    });

    it('should return allowed: true if within quota', async () => {
        const freePlan = await Plan.findOne({ name: "FREE" });
        await Merchant.create({
            shop: 'ok.myshopify.com',
            accessToken: 't',
            planId: freePlan?._id,
            usage: { quotesUsed: 2 }
        });

        const status = await planService.checkQuoteLimit('ok.myshopify.com');
        expect(status.allowed).toBe(true);
    });

    it('should return allowed: false if over quota', async () => {
        const freePlan = await Plan.findOne({ name: "FREE" });
        await Merchant.create({
            shop: 'over.myshopify.com',
            accessToken: 't',
            planId: freePlan?._id,
            usage: { quotesUsed: 5 }
        });

        const status = await planService.checkQuoteLimit('over.myshopify.com');
        expect(status.allowed).toBe(false);
        expect(status.message).toContain('limit reached');
    });

    it('should check for remove branding feature based on permissions array', async () => {
        const proPlan = await Plan.findOne({ name: "PRO" });
        await Merchant.create({
            shop: 'pro-shop.myshopify.com',
            accessToken: 't',
            planId: proPlan?._id
        });

        const hasBrandingRemov = await planService.hasFeature('pro-shop.myshopify.com', 'removeBranding');
        expect(hasBrandingRemov).toBe(true);

        const freePlan = await Plan.findOne({ name: "FREE" });
        await Merchant.create({
            shop: 'free-shop2.myshopify.com',
            accessToken: 't',
            planId: freePlan?._id
        });

        const hasBrandingRemovFree = await planService.hasFeature('free-shop2.myshopify.com', 'removeBranding');
        expect(hasBrandingRemovFree).toBe(false);
    });
});
