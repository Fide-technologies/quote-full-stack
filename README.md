# 🚀 Merchant Quote App

![App Logo](./frontend/public/app-icon.png)

A comprehensive, full-stack Shopify App built to empower merchants with a powerful **Custom Quote Request System**. This app allows merchants to replace the "Add to Cart" button with a "Request a Quote" flow, enabling professional B2B and custom-service interactions.

---

## 🛠 Project Architecture

This application is built with a modern, high-performance stack:

- **Runtime**: [Bun](https://bun.sh/) (Fastest JavaScript runtime)
- **Frontend**: [React](https://reactjs.org/) + [Shopify Polaris](https://polaris.shopify.com/) (The industry standard for Shopify Admin UI)
- **Backend**: [Express.js](https://expressjs.com/) + [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Scalable document storage)
- **Deployment**: [Fly.io](https://fly.io/) (High-performance serverless cloud)
- **CI/CD**: [GitHub Actions](https://github.com/features/actions) (Automated testing and deployment)

---

## ✨ Core Features

### 🛠 Powerful Form Builder
- **Custom Fields**: Add text, numbers, dropdowns, and file uploads.
- **Real-time Preview**: See how your quote form looks to customers instantly.
- **Conditional Logic**: Show/hide fields based on user input (Upcoming).

### 🏷 Quote Management
- **Draft Orders**: Automatically generate Shopify Draft Orders from quote requests.
- **Custom Pricing**: Adjust taxes, shipping, and item prices before sending.
- **Admin Dashboard**: Manage all pending, approved, and sent quotes in one place.

### 🎨 Fully Customizable Display
- **App Embeds**: Seamless integration with any Shopify 2.0 Theme.
- **Custom Styling**: Adjust button colors, fonts, and labels to match your brand.
- **Success Popups**: Customizable post-submission confirmation screen.

---

## 📦 Directory Structure

```plaintext
├── backend-express/   # Express.js API & Business Logic
├── frontend/          # React.js Admin Interface (Polaris)
├── extensions/        # Shopify Theme App Extensions (Liquid/CSS/JS)
├── .github/           # CI/CD Workflows (GitHub Actions)
└── fly.toml           # Hosting Configuration (Fly.io)
```

---

## 🚀 Future Roadmap

- [ ] **Email Templates**: Custom HTML/CSS email editor for quote responses.
- [ ] **Multi-currency Support**: Automatic currency conversion based on store settings.
- [ ] **Inventory Sync**: Check availability before allowing a quote request.
- [ ] **API Access**: Public API for integration with 3rd party CRMs.

---

## 🏁 Conclusion

The **Merchant Quote App** is designed for performance, scalability, and a premium merchant experience. By leveraging the power of Bun and Shopify Polaris, it provides a seamless bridge between complex B2B needs and the standard Shopify storefront.

---
*Built with ❤️ by [FIDE Technologies](https://fidetech.co/)*
