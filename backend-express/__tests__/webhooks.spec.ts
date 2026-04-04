import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { App } from '@/app';
import { Merchant } from '@/models/merchant.model';
import crypto from 'crypto';

describe('Webhooks Integration', () => {
    // Explicitly initialize app inside describe to ensure it picks up envs from setup.ts
    const appInstance = new App();
    const server = appInstance.app;

    beforeAll(async () => {
        await Merchant.create({
            shop: 'test-shop.myshopify.com',
            accessToken: 'fake_token',
            isActive: true,
            installedAt: new Date()
        });
    });

    const generateHMAC = (body: string, secret: string) => {
        return crypto
            .createHmac('sha256', secret)
            .update(body, 'utf8')
            .digest('base64');
    };

    it('should process APP_UNINSTALLED and mark merchant inactive', async () => {
        const shop = 'test-shop.myshopify.com';
        const payload = JSON.stringify({ shop_id: 12345, shop_domain: shop });

        // Match the secret in setup.ts: test_secret
        const hmac = generateHMAC(payload, "test_secret");

        const response = await request(server)
            .post('/api/webhooks')
            .set('X-Shopify-Hmac-Sha256', hmac)
            .set('X-Shopify-Topic', 'app/uninstalled')
            .set('X-Shopify-Shop-Domain', shop)
            .set('X-Shopify-API-Version', '2026-01')
            .set('X-Shopify-Webhook-Id', 'fake-uuid-123') // Added mandatory Shopify headers
            .set('Content-Type', 'application/json')
            .send(payload);

        // Debugging the response on failure
        if (response.status !== 200) {
            console.error("Webhook processing failed with status:", response.status, "Body:", response.body);
        }

        expect(response.status).toBe(200);

        const updatedMerchant = await Merchant.findOne({ shop });
        expect(updatedMerchant?.isActive).toBe(false);
    });

    it('should 401 if HMAC is invalid', async () => {
        const response = await request(server)
            .post('/api/webhooks')
            .set('X-Shopify-Hmac-Sha256', 'wrong-hmac')
            .set('X-Shopify-Topic', 'app/uninstalled')
            .set('X-Shopify-Shop-Domain', 'test-shop.myshopify.com')
            .send(JSON.stringify({ test: true }));

        expect(response.status).toBe(401); // 401 means HMAC check failed (expected)
    });
});
