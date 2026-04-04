# Testing Strategy - Merchant Quote App

This app follows a multi-layered testing strategy to ensure reliability and compliance with Shopify's App Store standards.

## 🧪 Testing Layers

### 1. Integration Tests (Backend)
Located in `backend-express/__tests__/`. We use **Bun**'s built-in test runner.
These tests verify:
- API endpoints (Supertest)
- Webhook signature verification (HMAC)
- Billing / Plan quota logic
- Database state changes

**Run Tests:**
```bash
cd backend-express
NODE_ENV=development bun test
```

### 2. Unit Tests
We test core services such as `PlanService` and `UsageService` to ensure pricing logic and feature availability are correctly enforced.

### 3. E2E Testing (Playwright)
We use Playwright to simulate the merchant's journey:
- Installing the app.
- Onboarding and theme setup.
- Generating a quote from the storefront.
- Managing quotes in the Admin.

**Run E2E:**
```bash
npx playwright test
```

---

## 🔒 Security Testing
We specifically test the **App Proxy** and **Webhook** signature verification.
- Proxy requests MUST include a valid HMAC.
- Webhook requests MUST be signed by Shopify's secret.

## 💸 Billing Testing
We test the `app_subscriptions/update` webhook to ensure that if a merchant cancels through Shopify, our app correctly reflects the `FREE` plan status.

## 🛠 Setup for Testing
1. Install dependencies: `bun install`
2. Run MongoDB Memory Server (handled automatically by specified tests).
3. Set your `SHOPIFY_API_SECRET` in `.env.test`.
