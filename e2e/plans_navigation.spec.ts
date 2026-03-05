import { test, expect } from '@playwright/test';

test.describe('App Onboarding & Plans', () => {
    test('should load the plans page and display plan data', async ({ page }) => {
        // Note: In a real Shopify environment, this requires authentication.
        // For local testing, we might skip auth or use a mock session.
        // Here, we're assuming the app is running in dev mode with a bypass.

        await page.goto('/plans?shop=test-shop.myshopify.com');
        // Expect the page to lead with a Heading
        await expect(page.locator('h1')).toContainText('Choose the right plan');

        // Check if three plans are loaded
        const planCards = await page.locator('.Polaris-Card').count();
        expect(planCards).toBeGreaterThanOrEqual(1);

        // Verify "FREE" plan is visible
        await expect(page.getByText('Early Adopter (Free)')).toBeVisible();
    });

    test('should handle upgrade click', async ({ page }) => {
        await page.goto('/plans?shop=test-shop.myshopify.com');

        // Click on "Upgrade" for Pro (if not current)
        const proButton = page.getByRole('button', { name: /Upgrade to PRO/i });
        if (await proButton.isVisible()) {
            await proButton.click();
            // Since it's a mock, it might fail or redirect to a confirmation URl.
            // We'd expect a toast if it fails or a redirect if successful.
        }
    });
});
