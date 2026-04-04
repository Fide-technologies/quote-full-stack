# 🎨 Merchant Quote Frontend

![Frontend Logo](../frontend/public/app-icon.png)

This is the **Shopify Admin Embedded App** interface. It allows merchants to customize their "Request a Quote" form, manage submissions, and configure overall app settings.

---

## 🛠 Tech Stack

- **Framework**: [React](https://react.dev/)
- **UI System**: [Shopify Polaris](https://polaris.shopify.com/) (Component Library)
- **State Management**: [React Hooks](https://react.dev/reference/react/hooks) & Context API
- **API Communication**: [Axios](https://axios-http.com/)
- **Validation**: [Zod](https://zod.dev/)

---

## 📂 Key Components

- **`<FormBuilder />`**: The core interactive interface for designing the quote form.
- **`<PreviewCard />`**: Live real-time preview of the form as it would appear on the storefront.
- **`<Settings />`**: Comprehensive settings for success messages, branding, and button styles.
- **`<QuoteDashboard />`**: List view of all historical and pending quote requests.

---

## 🗺 Application Architecture

Following **React Best Practices**:

- **`src/api/`**: All backend service communications.
- **`src/components/`**: Atomic, reusable UI components.
- **`src/hooks/`**: Custom hooks for business logic (e.g., `useQuoteBuilder`).
- **`src/pages/`**: Main application views.
- **`src/utils/`**: Helper functions and formatters.

---

## 🚀 Features

- **Live Real-time Preview**: Synchronized builder and preview panes.
- **Tabbed Interface**: Clean separation between building, previewing, and settings.
- **Responsive Layout**: Designed specifically for the Shopify Admin's embedded frame.
- **Modern Styling**: Dark/Light mode support with premium HSL color palettes.

---

## 🏁 Future Updates

- **Drag-and-Drop Builder**: Reorder fields visually.
- **Extended Field Types**: Star ratings, location maps, and more.
- **Bulk Operations**: Manage multiple quotes at once.

---
*Created by FIDE Technologies*
