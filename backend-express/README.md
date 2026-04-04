# ⚙️ Merchant Quote Backend

![Backend Logo](../frontend/public/app-icon.png)

This is the **High-Performance Express.js Server** that handles all business logic, Shopify API communications, and MongoDB data storage for the Merchant Quote App.

---

## 🛠 Tech Stack

- **Runtime**: [Bun](https://bun.sh/)
- **Server**: [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) (using [Zod](https://zod.dev/) for validation)
- **Auth**: [Shopify API Library](https://github.com/Shopify/shopify-api-js)
- **Validation**: [Inversify](https://inversify.io/) (for Dependency Injection)

---

## 📂 Backend Architecture

- **`src/app/`**: Middleware, Express application initialization.
- **`src/config/`**: Database connections and app-wide configuration.
- **`src/controllers/`**: API endpoint handlers and routing logic.
- **`src/services/`**: Business logic layer (Shopify API interactions, Database operations).
- **`src/models/`**: MongoDB schemas and TypeScript types.
- **`src/utils/`**: Shared helpers, logging, and error handling.

---

## ✨ Core Functionality

- **Shopify Authentication**: Secure OAuth 2.0 flow for merchants.
- **Webhook Processing**: Real-time handling of `app/uninstalled` and other Shopify events.
- **Draft Order Creation**: Programmatically generating Shopify orders from customer requests.
- **Settings Store**: Persisting merchant-specific configurations (colors, button labels, messages).
- **Health Checks**: Diagnostic endpoints for uptime monitoring.

---

## 🚀 Advanced Features

- **Graceful Shutdown**: Protects database connections and in-progress requests during deployment.
- **Cluster Mode**: High-availability multi-core processing in production.
- **Type-Safe Environment Variables**: Full Zod validation for all `.env` requirements.

---

## 🏁 Future Roadmap

- **Redis Cache**: Speed up responses for common storefront queries.
- **Background Jobs**: Asynchronous processing with BullMQ for large-scale quote generation.
- **Webhook Retries**: Automated recovery for failed Shopify events.

---
*Created by FIDE Technologies*
