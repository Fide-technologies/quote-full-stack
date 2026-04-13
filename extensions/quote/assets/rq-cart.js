(function () {
    const STORAGE_KEY = 'rq-quote-cart';

    window.RqCart = {
        saveCart: function (cart) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
            this.updateBadge();
            this.renderCart();
        },

        getCart: function () {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        },

        addItem: function (item) {
            console.log('Adding to Quote Cart:', item);
            const cart = this.getCart();
            // Check for same variant and price (to handle different prices if applicable)
            const existingIndex = cart.findIndex(i => String(i.variantId) === String(item.variantId));

            if (existingIndex > -1) {
                cart[existingIndex].quantity = (parseInt(cart[existingIndex].quantity) || 0) + (parseInt(item.quantity) || 1);
            } else {
                cart.push({
                    variantId: item.variantId,
                    productId: item.productId,
                    title: item.title,
                    variantTitle: item.variantTitle,
                    price: item.price,
                    featured_image: item.featured_image,
                    quantity: parseInt(item.quantity) || 1,
                    handle: item.handle
                });
            }
            this.saveCart(cart);
            this.openCart();
        },

        removeItem: function (variantId) {
            let cart = this.getCart();
            cart = cart.filter(item => String(item.variantId) !== String(variantId));
            this.saveCart(cart);
        },

        updateQuantity: function (variantId, delta) {
            const cart = this.getCart();
            const item = cart.find(i => String(i.variantId) === String(variantId));
            if (item) {
                item.quantity = (parseInt(item.quantity) || 1) + delta;
                if (item.quantity < 1) {
                    this.removeItem(variantId);
                } else {
                    this.saveCart(cart);
                }
            }
        },

        openCart: function () {
            const drawer = document.getElementById('rq-cart-drawer');
            if (drawer) drawer.classList.add('open');
            this.renderCart();
        },

        closeCart: function () {
            const drawer = document.getElementById('rq-cart-drawer');
            if (drawer) drawer.classList.remove('open');
        },

        updateBadge: function () {
            const cart = this.getCart();
            const count = cart.reduce((acc, item) => acc + (parseInt(item.quantity) || 0), 0);
            const badges = document.querySelectorAll('.rq-cart-count');
            badges.forEach(b => {
                b.innerText = count;
                b.style.display = count > 0 ? 'flex' : 'none';
            });
        },

        formatPrice: function (price) {
            if (typeof Shopify !== 'undefined' && Shopify.formatMoney) {
                return Shopify.formatMoney(price);
            }
            // Fallback for simple formatting if Shopify object is missing
            return (price / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        },

        renderCart: function () {
            const drawerContent = document.getElementById('rq-cart-items-list');
            if (!drawerContent) return;

            const cart = this.getCart();
            if (cart.length === 0) {
                drawerContent.innerHTML = '<div class="rq-cart-empty">Your quote cart is empty.</div>';
                return;
            }

            drawerContent.innerHTML = cart.map(item => `
                <div class="rq-cart-item" data-variant-id="${item.variantId}">
                    <img src="${item.featured_image}" alt="${item.title}" class="rq-cart-item-img">
                    <div class="rq-cart-item-info">
                        <div class="rq-cart-item-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div class="rq-cart-item-title">${item.title}</div>
                            <button class="rq-cart-item-remove" onclick="window.RqCart.removeItem('${item.variantId}')" title="Remove item">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                        </div>
                        <div class="rq-cart-item-variant">${item.variantTitle && item.variantTitle !== 'Default Title' ? item.variantTitle : ''}</div>
                        <div class="rq-cart-item-price">${this.formatPrice(item.price)}</div>
                        <div class="rq-cart-item-qty">
                            <button class="rq-cart-item-qty-btn" onclick="window.RqCart.updateQuantity('${item.variantId}', -1)">−</button>
                            <span class="rq-cart-item-qty-value">${item.quantity}</span>
                            <button class="rq-cart-item-qty-btn" onclick="window.RqCart.updateQuantity('${item.variantId}', 1)">+</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    };

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.RqCart.updateBadge());
    } else {
        window.RqCart.updateBadge();
    }
})();
