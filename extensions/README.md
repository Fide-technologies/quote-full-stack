# 🎨 Merchant Quote Extensions

![Extensions Logo](../frontend/public/app-icon.png)

This folder contains the **Shopify Theme App Extension**, which powers the storefront experience. Using **Shopify 2.0 App Embeds**, it injects the "Request a Quote" button and form directly into any theme without manual code editing.

---

## 🛠 Tech Stack

- **Template Engine**: [Liquid](https://shopify.dev/docs/themes/liquid/reference)
- **Styling**: [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) (Modular, scoped styles)
- **Logic**: [Vanilla JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) (Standard ES6+ components)
- **System**: [Shopify App Embeds](https://shopify.dev/docs/apps/online-store/theme-app-extensions/extensions-framework#app-embed-blocks)

---

## 📂 Extension Components

- **`blocks/quote_embed.liquid`**: The core App Embed block that injects our button and form into the storefront.
- **`snippets/request-quote-form-ui.liquid`**: The reusable Liquid snippet that renders the dynamic quote form.
- **`assets/rq-ui.js`**: The main JavaScript interaction layer that handles form submission and success popups.
- **`assets/request-quote.css`**: The design system for buttons, modals, and the form itself.

---

## ✨ Features

- **Merchant-Controlled Visibility**: Enable/disable the "Request a Quote" button at the product level or globally via Metafields.
- **Dynamic Configuration**: Automatically loads button colors, labels, and success messages from our Backend.
- **Theme Adaptation**: Designed to work seamlessly with Dawn and other modern Shopify 2.0 themes.
- **AJAX Submissions**: No page reloads; smooth customer experience from form to completion.

---

## 🗺 Request Flow

1.  **Detection**: The Liquid block checks if the product is eligible for quote requests.
2.  **Rendering**: The "Request a Quote" button is injected into the theme's default product form.
3.  **Interaction**: Customer clicks the button, and our dynamic form modal appears.
4.  **Submission**: Form data is sent to our Express Backend and converted into a Draft Order.
5.  **Confirmation**: Our success popup appears based on the merchant's custom text.

---

## 🚀 Future Roadmap

- **Multi-language Support**: Fully translate the storefront strings into multiple languages.
- **Custom Button Placements**: Choose exactly where on the page the button appears via App Blocks.
- **Animations**: Introduce subtle CSS animations for form transitions and popups.

---
*Created by FIDE Technologies*
