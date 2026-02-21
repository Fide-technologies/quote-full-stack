(function () {
    const SETTINGS = window.rqGlobalSettings || {
        buttonText: 'Add to Quote',
        buttonColor: '#000000'
    };


    window.rqOpenModal = function (blockId) {
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

    window.rqOpenQuoteFormFromCart = function () {
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
        window.RqUi.openModal(blockId);

        // Mark this as a bulk submission
        modal.dataset.isBulk = 'true';
    };

    function rqPopulateReviewStep(blockId) {
        const getVal = (id) => document.getElementById(id + blockId)?.value || '';
        const setText = (id, text) => {
            const el = document.getElementById(id + blockId);
            if (el) el.innerText = text;
        };

        // Contact Info
        const fname = getVal('rq-fname-');
        const lname = getVal('rq-lname-');
        const email = getVal('rq-email-');
        const phone = getVal('rq-phone-');
        setText('rq-review-contact-', `${fname} ${lname}\n${email}\n${phone}`);

        // Address
        const addr1 = getVal('rq-address1-');
        const addr2 = getVal('rq-address2-');
        const city = getVal('rq-city-');
        const dist = getVal('rq-district-');
        const state = getVal('rq-state-');
        const pin = getVal('rq-pincode-');

        let addressText = addr1;
        if (addr2) addressText += `\n${addr2}`;
        addressText += `\n${city}, ${dist}\n${state} - ${pin}`;
        setText('rq-review-address-', addressText);

        // Message
        const msg = getVal('rq-message-');
        setText('rq-review-message-', msg || '(No message included)');
    }

    window.rqNextStep = function (blockId, currentStep) {
        let isValid = false;
        if (currentStep === 1) isValid = window.RqValidation.validateStep1(blockId);
        if (currentStep === 2) isValid = window.RqValidation.validateStep2(blockId);
        if (currentStep === 3) isValid = window.RqValidation.validateStep3(blockId);

        if (isValid) {
            if (currentStep === 3) {
                rqPopulateReviewStep(blockId);
            }

            document.getElementById('rq-step-' + currentStep + '-' + blockId).classList.remove('active');
            document.getElementById('rq-step-' + (currentStep + 1) + '-' + blockId).classList.add('active');

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

        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.rqOpenQuoteForProduct(btn, handle);
        };
        return btn;
    }



    function scanAndInject() {
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
                hideElement(form);

                // Identify the best container to search for prices
                // On product pages, we search a broader area (the section) because prices are often not near the form
                const container = isProductPage
                    ? (form.closest('.shopify-section, section, .product-grid, main') || form.parentNode)
                    : (card || form.parentNode);

                if (container) {
                    const priceSelectors = '.price, .money, .product-price, .product__price, .price__regular, .price__sale, .regular-price, .product-item__price, .product-single__price, .price-item';
                    container.querySelectorAll(priceSelectors).forEach(hideElement);
                }

                // Only inject the Quote button on actual Product detail pages
                // AND ensure it's not in a "recommendations" or "suggested" section
                const isRecommendation = form.closest('.product-recommendations, .related-products, .recommendations, .up-sell, .cross-sell, .complementary-products, .suggested-products, [class*="recommendation"], [class*="related-"]');

                if (isProductPage && !isRecommendation) {
                    if (hasQuoteBtn(form.parentNode)) return;
                    if (card && hasQuoteBtn(card)) return;

                    const btn = createQuoteButton(handle);
                    form.parentNode.insertBefore(btn, form);
                }

                form.dataset.rqProcessed = 'true';
            }
        });
    }

    window.rqScanAndInject = scanAndInject;
    window.addEventListener('load', scanAndInject);
    const observer = new MutationObserver((mutations) => scanAndInject());
    observer.observe(document.body, { childList: true, subtree: true });
    scanAndInject();
    window.rqInitialized = true;

})();
