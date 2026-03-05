import { describe, it, expect, beforeAll, vi } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';

// Hoist the mock above all imports
vi.mock('@/config/shopify.config', async (importOriginal) => {
    const actual = await importOriginal() as any;
    return {
        ...actual,
        shopify: {
            ...actual.shopify,
            validateAuthenticatedSession: () => (req: any, res: any, next: any) => {
                // Bypass OAuth for tests
                res.locals.shopify = {
                    session: { shop: 'test-shop.myshopify.com', accessToken: 'token' }
                };
                next();
            },
            cspHeaders: () => (req: any, res: any, next: any) => next()
        }
    };
});

import { App } from '@/app';
import { Plan } from '@/models/plan.model';
import { Merchant } from '@/models/merchant.model';

describe('Plans API Integration', () => {
    const appInstance = new App();
    const server = appInstance.app;

    beforeAll(async () => {
        await Merchant.deleteMany({});
        await Plan.deleteMany({});

        // Seeding required data for integration tests
        const freePlan = await Plan.create({
            name: "FREE",
            price: mongoose.Types.Decimal128.fromString("0"),
            quoteLimit: 50,
            billingReset: false,
            permissions: ["QUOTE_CREATE", "QUOTE_READ"],
            isActive: true
        });

        await Merchant.create({
            shop: 'test-shop.myshopify.com',
            accessToken: 'test-token',
            planId: freePlan._id,
            isActive: true
        });
    });

    it('should list all available plans correctly', async () => {
        const response = await request(server)
            .get('/api/plans')
            .set('Accept', 'application/json');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThanOrEqual(1);
        expect(response.body.data[0].name).toBe('FREE');
    });

    it('should return current merchant plan', async () => {
        const response = await request(server).get('/api/plans/current');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).not.toBeNull();
        expect(response.body.data.name).toBe('FREE');
    });
});
