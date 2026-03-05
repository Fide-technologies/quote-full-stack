import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { App } from '@/app';

describe('Health Check API', () => {
    // We create the app instance inside describe to ensure envs from setup are picked up
    const appInstance = new App();
    const server = appInstance.app;

    it('should return 200 OK for /health', async () => {
        const response = await request(server).get('/health');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'OK');
        expect(response.body).toHaveProperty('timestamp');
    });

    it('should return 200 (HTML) for random non-api routes (SPA behavior)', async () => {
        const response = await request(server).get('/app/dashboard');

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toContain('text/html');
    });
});
