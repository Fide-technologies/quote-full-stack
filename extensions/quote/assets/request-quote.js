(function () {
    const SETTINGS = window.rqGlobalSettings || {
        buttonText: 'Add to Quote',
        buttonColor: '#008060',
        buttonTextColor: '#FFFFFF',
        hideAddToCart: true,
        hideBuyNow: false,
        placementLocation: 'above'
    };


    window.rqOpenModal = async function (blockId) {
        const modal = document.getElementById(`rqModal-${blockId}`);
        if (!modal) return;

        // Default: not bulk unless specified (handled by opener, but just in case)
        if (!modal.dataset.isBulk || modal.dataset.isBulk === 'undefined') {
            modal.dataset.isBulk = 'false';
        }

        // If it's a single product (not bulk) and we're on a product page, 
        // try to populate it even if Liquid didn't (e.g., global embed on product page)
        if (modal.dataset.isBulk === 'false') {
            const handleMatch = window.location.pathname.match(/\/products\/([^\/\?]+)/);
            if (handleMatch) {
                const handle = handleMatch[1];
                try {
                    const product = await window.RqApi.fetchProduct(handle);
                    if (product && window.RqUi.populateHiddenFields) {
                        window.RqUi.populateHiddenFields(modal, product);
                        window.RqUi.showProductSummary(modal, product);
                    }
                } catch (e) {
                    console.error("Failed to populate modal for product:", e);
                }
            }
        }

        // Check if the form is already loaded so we don't fetch it every time
        if (modal.dataset.formLoaded !== 'true') {
            const dynamicContainer = document.getElementById(`rq-dynamic-form-${blockId}`);
            if (dynamicContainer) {
                dynamicContainer.innerHTML = '<div style="text-align:center; padding: 2rem;">Loading form...</div>';
            }

            try {
                // Determine the shop domain
                const shop = window.Shopify ? window.Shopify.shop : window.location.hostname;
                const formConfig = await window.RqApi.fetchFormConfig(shop);
                if (formConfig && formConfig.steps) {
                    window._rqFormConfig = formConfig;
                    window.RqUi.buildDynamicForm(blockId, formConfig);
                    modal.dataset.formLoaded = 'true';
                } else {
                    if (dynamicContainer) {
                        dynamicContainer.innerHTML = '<div style="color:red; text-align:center; padding: 2rem;">Error loading form configuration.</div>';
                    }
                }
            } catch (err) {
                console.error("Failed to fetch and build form:", err);
                if (dynamicContainer) {
                    dynamicContainer.innerHTML = '<div style="color:red; text-align:center; padding: 2rem;">An error occurred while loading the form.</div>';
                }
            }
        }

        window.RqUi.openModal(blockId);
    };

    window.rqCloseModal = function (blockId) {
        window.RqUi.closeModal(blockId);
    };

    window.rqResetAndClose = function (blockId) {
        window.RqUi.closeModal(blockId);
        window.RqUi.resetForm(blockId);
    };

    window.rqAddToQuoteCart = async function (handle, blockId, event) {
        // Find the button that was clicked
        const btn = event ? event.currentTarget : null;
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Adding...';
        btn.disabled = true;

        try {
            const product = await window.RqApi.fetchProduct(handle);
            if (product) {
                // Get qty from the page input
                const qty = parseInt(document.getElementById('rqPageQtyInput')?.value) || 1;

                // Construct cart item
                const item = {
                    productId: product.id,
                    variantId: product.variants[0].id, // Default to first variant
                    title: product.title,
                    variantTitle: product.variants[0].title,
                    price: product.variants[0].price,
                    featured_image: product.featured_image,
                    quantity: qty,
                    handle: handle
                };

                window.RqCart.addItem(item);
                btn.innerHTML = '✓ Added';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }, 2000);
            }
        } catch (error) {
            console.error('Failed to add to cart:', error);
            alert('Could not add product to quote cart.');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    };

    window.rqOpenQuoteFormFromCart = async function () {
        const cart = window.RqCart.getCart();
        if (cart.length === 0) {
            alert('Your quote cart is empty.');
            return;
        }

        const blockId = 'global';
        const modal = document.getElementById(`rqModal-${blockId}`);
        if (!modal) {
            alert('Quote modal not found.');
            return;
        }

        window.RqCart.closeCart();
        window.RqUi.showBulkSummary(modal, cart);

        // Mark as bulk BEFORE opening or right after
        modal.dataset.isBulk = 'true';

        // This will also handle fetching/building the dynamic form if not loaded yet
        await window.rqOpenModal(blockId);

        // Re-ensure bulk remains true after potential reset inside openModal (safety)
        modal.dataset.isBulk = 'true';
    };

    function resizeImage(url, size) {
        if (!url || typeof url !== 'string') return url || '';
        if (url.includes('cdn.shopify.com')) {
            const separator = url.includes('?') ? '&' : '?';
            return `${url}${separator}width=${size}`;
        }
        return url;
    }

    async function rqPopulateReviewStep(blockId) {
        const modal = document.getElementById(`rqModal-${blockId}`);
        const setHtml = (id, html) => {
            const el = document.getElementById(id + blockId);
            if (el) el.innerHTML = html;
        };

        // 1. Items Review Section
        const isBulk = modal?.dataset.isBulk === 'true';
        if (isBulk && window.RqCart) {
            const cart = window.RqCart.getCart();
            let itemsHtml = '<div class="rq-review-items-card">';
            let total = 0;
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                itemsHtml += `
                    <div class="rq-review-item-row">
                        <img src="${resizeImage(item.featured_image, 120)}">
                        <div style="flex: 1; margin: 0 16px;">
                            <div style="font-weight: 700; font-size: 15px; color: #1a1a1b; margin-bottom: 2px;">${item.title}</div>
                            <div style="font-size: 13px; color: #6d7175;">${item.variantTitle !== 'Default Title' ? item.variantTitle : ''}</div>
                        </div>
                        <div style="text-align: right; flex-shrink: 0;">
                            <div style="font-size: 14px; font-weight: 700; color: #1a1a1b;">× ${item.quantity}</div>
                            <div style="font-size: 14px; color: #6366f1; font-weight: 700;">${window.RqCart.formatPrice(item.price)}</div>
                        </div>
                    </div>
                `;
            });
            itemsHtml += `
                <div style="margin-top: 16px; padding-top: 16px; border-top: 2px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 800; font-size: 16px; color: #1a1a1b;">Total Estimate</span>
                    <span style="font-weight: 800; font-size: 20px; color: #6366f1;">${window.RqCart.formatPrice(total)}</span>
                </div>
            `;
            itemsHtml += '</div>';
            setHtml('rq-review-items-', itemsHtml);
        } else {
            const form = document.getElementById(`rq-form-${blockId}`);
            if (form) {
                const title = form.querySelector('[name="productTitle"]')?.value;
                const price = parseFloat(form.querySelector('[name="price"]')?.value) || 0;
                const qty = parseInt(form.querySelector('[name="quantity"]')?.value) || 1;
                const vTitle = form.querySelector('[name="variantTitle"]')?.value;
                const img = form.querySelector('[name="productImage"]')?.value;
                const total = price * qty;

                let itemsHtml = `
                    <div class="rq-review-items-card">
                        <div class="rq-review-item-row">
                            <img src="${resizeImage(img, 120)}">
                            <div style="flex: 1; margin: 0 16px;">
                                <div style="font-weight: 700; font-size: 16px; color: #1a1a1b; margin-bottom: 2px;">${title}</div>
                                <div style="font-size: 14px; color: #6d7175;">${vTitle !== 'Default Title' ? vTitle : ''}</div>
                            </div>
                            <div style="text-align: right; flex-shrink: 0;">
                                <div style="font-size: 15px; font-weight: 700; color: #1a1a1b;">× ${qty}</div>
                                <div style="font-size: 15px; color: #6366f1; font-weight: 700;">${window.RqCart.formatPrice(price * 100)}</div>
                            </div>
                        </div>
                        <div style="margin-top: 16px; padding-top: 16px; border-top: 2px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 800; font-size: 16px; color: #1a1a1b;">Total Estimate</span>
                            <span style="font-weight: 800; font-size: 20px; color: #6366f1;">${window.RqCart.formatPrice(total * 100)}</span>
                        </div>
                    </div>
                `;
                setHtml('rq-review-items-', itemsHtml);
            }
        }

        // 2. Dynamic Field Population
        const customFieldsContainer = document.getElementById(`rq-review-custom-fields-${blockId}`);
        if (customFieldsContainer && window._rqFormConfig) {
            let customHtml = '';

            // Use for...of to handle await inside
            for (const step of window._rqFormConfig.steps) {
                if (step.id === 'step-review') continue;

                let stepFieldsHtml = '';
                let hasValue = false;

                for (const field of step.fields) {
                    const fieldName = field.id.replace('field-', '');
                    const inputEl = document.getElementById(`rq-${fieldName}-${blockId}`);
                    let displayValue = '';

                    if (field.type === 'file') {
                        const files = inputEl?._rq_files || (inputEl?.files ? Array.from(inputEl.files) : []);
                        if (files.length > 0) {
                            const fileDataUrls = await Promise.all(files.map(file => {
                                return new Promise((resolve) => {
                                    const reader = new FileReader();
                                    reader.onload = (e) => resolve(e.target.result);
                                    reader.onerror = () => resolve(null);
                                    reader.readAsDataURL(file);
                                });
                            }));

                            displayValue = '<div class="rq-review-image-grid">';
                            fileDataUrls.forEach(url => {
                                if (url) {
                                    displayValue += `<div class="rq-review-image-item"><img src="${url}"></div>`;
                                }
                            });
                            displayValue += '</div>';
                        }
                    } else if (inputEl) {
                        displayValue = inputEl.value.trim();
                    }

                    if (displayValue) {
                        hasValue = true;
                        stepFieldsHtml += `
                            <div class="rq-review-card">
                                <div class="rq-card-header">
                                    <h4>${field.label}</h4>
                                </div>
                                <div class="rq-card-content">
                                    <div class="${field.type === 'file' ? 'rq-review-files' : 'rq-review-text'}">${displayValue}</div>
                                </div>
                            </div>
                        `;
                    }
                }

                if (hasValue) {
                    customHtml += `
                        <div class="rq-review-section-header">
                            ${step.title}
                        </div>
                        <div class="rq-review-grid">${stepFieldsHtml}</div>
                    `;
                }
            }

            customFieldsContainer.innerHTML = customHtml;
        }

        // 3. Hide legacy fallback sections as they are now handled dynamically
        const oldGrid = document.querySelector(`#rqModal-${blockId} .rq-review-grid`);
        if (oldGrid && oldGrid.id !== 'dynamic-grid') { // safety
            // oldGrid.style.display = 'none'; // We could hide them, but let's just leave the dynamic content to be the main source
        }
    }

    window.rqNextStep = async function (blockId, currentStep) {
        let isValid = false;
        if (window.RqValidation && window.RqValidation.validateStep) {
            isValid = window.RqValidation.validateStep(blockId, currentStep);
        }

        if (isValid) {
            const nextStepContainer = document.getElementById('rq-step-' + (currentStep + 1) + '-' + blockId);
            if (!nextStepContainer) {
                console.error("Next step container not found.");
                return;
            }

            // If the next step is the last step (Review), populate it
            const isReviewStep = nextStepContainer.querySelector('.rq-review-container') !== null;
            if (isReviewStep) {
                await rqPopulateReviewStep(blockId);
            }

            document.getElementById('rq-step-' + currentStep + '-' + blockId).classList.remove('active');
            nextStepContainer.classList.add('active');

            if (window.RqUi && window.RqUi.updateProgressIndicator) {
                window.RqUi.updateProgressIndicator(blockId, currentStep + 1);
            }
        }
    };

    window.rqPrevStep = function (blockId, currentStep) {
        document.getElementById('rq-step-' + currentStep + '-' + blockId).classList.remove('active');
        document.getElementById('rq-step-' + (currentStep - 1) + '-' + blockId).classList.add('active');

        if (window.RqUi && window.RqUi.updateProgressIndicator) {
            window.RqUi.updateProgressIndicator(blockId, currentStep - 1);
        }
    };

    window.rqValidateAndSubmit = async function (blockId) {
        const modal = document.getElementById(`rqModal-${blockId}`);
        const isBulk = modal?.dataset.isBulk === 'true';
        const cartItems = isBulk ? window.RqCart.getCart() : null;

        const btn = document.querySelector(`#rq-step-4-${blockId} button.rq-submit-final`);
        const originalText = btn ? btn.innerHTML : 'Submit Quote';
        if (btn) {
            btn.innerText = 'Requesting...';
            btn.disabled = true;
        }

        try {
            const result = await window.RqApi.submitQuote(blockId, cartItems);

            if (result.success) {
                window.RqUi.showSuccess(blockId, result.data);
                if (isBulk) {
                    window.RqCart.saveCart([]); // Clear cart on success
                    modal.dataset.isBulk = 'false';
                }
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            console.error('Submission UI error:', error);
            alert('An unexpected error occurred during submission.');
        } finally {
            if (btn) {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }
    };

    // Global function to update page qty from standard + - buttons if used
    window.rqUpdatePageQty = function (change) {
        const input = document.getElementById('rqPageQtyInput');
        if (!input) return;
        let newVal = (parseInt(input.value) || 1) + change;
        if (newVal < 1) newVal = 1;
        input.value = newVal;
    };


    /* --- Injection Logic --- */

    window.rqOpenQuoteForProduct = async function (btn, handle) {
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Adding...';
        btn.disabled = true;

        try {
            const product = await window.RqApi.fetchProduct(handle);
            if (product) {
                // Get qty from the page input
                const qtyInput = document.getElementById('rqPageQtyInput');
                const qty = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;

                // Construct cart item
                const item = {
                    productId: product.id,
                    variantId: product.variants[0].id,
                    title: product.title,
                    variantTitle: product.variants[0].title,
                    price: product.variants[0].price,
                    featured_image: product.featured_image,
                    quantity: qty,
                    handle: handle
                };

                window.RqCart.addItem(item);
                btn.innerHTML = '✓ Added';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }, 2000);
            }
        } catch (error) {
            console.error('Failed to add to cart:', error);
            alert('Could not add product to quote cart.');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    };

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('rq-modal')) {
            window.rqCloseModal('global');
        }
        if (e.target.closest('.rq-modal-close')) {
            window.rqCloseModal('global');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') window.rqCloseModal('global');
    });


    function createQuoteButton(handle) {
        const btn = document.createElement('button');
        btn.className = 'rq-btn-injected';
        btn.innerText = SETTINGS.buttonText;
        btn.style.setProperty('--rq-primary', SETTINGS.buttonColor);
        btn.style.setProperty('--rq-primary-hover', SETTINGS.buttonColor);
        btn.style.color = SETTINGS.buttonTextColor;

        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.rqOpenQuoteForProduct(btn, handle);
        };
        return btn;
    }

    function scanAndInject() {
        if (!SETTINGS.appEnabled || SETTINGS.shouldShow === false) return;
        
        const productBlockExists = !!document.querySelector('.rq-product-page-form');
        const isProductPage = window.location.pathname.includes('/products/') || productBlockExists;

        const hasQuoteBtn = (container) => container.querySelector('.rq-btn') || container.querySelector('.rq-btn-injected');
        const hideElement = (el) => {
            if (el) {
                el.style.setProperty('display', 'none', 'important');
                el.style.setProperty('visibility', 'hidden', 'important');
            }
        };

        const forms = document.querySelectorAll('form[action*="/cart/add"]');
        forms.forEach(form => {
            if (form.dataset.rqProcessed) return;
            if (productBlockExists) {
                const section = form.closest('.shopify-section, section');
                if (section && section.querySelector('.rq-btn')) return;
            }

            let handle = null;
            const card = form.closest('.product-card, .card, .card-wrapper, .grid-view-item, .product-item, .grid__item') || form.parentElement;
            if (card) {
                const link = card.querySelector('a[href*="/products/"]');
                if (link) handle = link.getAttribute('href').match(/\/products\/([^\/\?]+)/)?.[1];
            }
            if (!handle && window.location.pathname.includes('/products/')) {
                handle = window.location.pathname.match(/\/products\/([^\/\?]+)/)?.[1];
            }

            if (handle) {
                // 1. Hide Standard Buttons and Quantity based on settings
                if (SETTINGS.hideAddToCart) {
                    const selectors = [
                        '[name="add"]', '.product-form__submit', '.add-to-cart', '.btn--add-to-cart', '[data-add-to-cart]',
                        '.quantity', '.product-form__input--quantity', '.product-form__item--quantity', '[name="quantity"]', '.qty-wrapper', '.product-form__quantity',
                        '.quantity-selector-wrapper', 'quantity-selector-component', '.quantity-selector', '.quantity__input'
                    ];
                    selectors.forEach(selector => {
                        form.querySelectorAll(selector).forEach(hideElement);
                    });
                }

                // 2. Hide Prices based on settings
                if (SETTINGS.hidePriceGlobal || SETTINGS.loginToSeePrice) {
                    const container = isProductPage
                        ? (form.closest('.shopify-section, section, .product-grid, main') || form.parentNode)
                        : (card || form.parentNode);

                    if (container) {
                        const priceSelectors = '.price, .money, .product-price, .product__price, .price__regular, .price__sale, .regular-price, .product-item__price, .product-single__price, .price-item';
                        container.querySelectorAll(priceSelectors).forEach(hideElement);
                    }
                }

        // 2. Hide Buy It Now / Dynamic Checkout
        if (SETTINGS.hideBuyNow) {
            const buyNowSelectors = [
                '.shopify-payment-button',
                '.shopify-payment-button__button--unbranded',
                '.payment-buttons',
                '.product-form__payment-container'
            ];
            buyNowSelectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(hideElement);
            });
        }

                // 3. Inject Quote Button with specific placement
                const isRecommendation = form.closest('.product-recommendations, .related-products, .recommendations, .up-sell, .cross-sell, .complementary-products, .suggested-products, [class*="recommendation"], [class*="related-"]');

                if (isProductPage && !isRecommendation) {
                    if (hasQuoteBtn(form.parentNode)) return;
                    if (card && hasQuoteBtn(card)) return;

                    const btn = createQuoteButton(handle);
                    
                    if (SETTINGS.placementLocation === 'below') {
                        // After the form
                        form.parentNode.insertBefore(btn, form.nextSibling);
                    } else {
                        // Before the form (default)
                        form.parentNode.insertBefore(btn, form);
                    }
                }

                form.dataset.rqProcessed = 'true';
            }
        });
    }

    window.rqScanAndInject = scanAndInject;
    window.addEventListener('load', () => {
        scanAndInject();
        // Dynamic Checkout Catch-up Polling
        if (SETTINGS.appEnabled && SETTINGS.shouldShow !== false && SETTINGS.hideBuyNow) {
            let count = 0;
            const interval = setInterval(() => {
                scanAndInject();
                if (++count >= 10) clearInterval(interval);
            }, 300);
        }
    });

    const observer = new MutationObserver((mutations) => {
        // Only run scan if children changed or dynamically injected buttons might be present
        scanAndInject();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    scanAndInject();
    window.rqInitialized = true;

})();
