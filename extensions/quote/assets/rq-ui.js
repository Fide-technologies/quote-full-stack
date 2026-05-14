(function () {
    window.RqUi = {
        openModal: function (blockId) {
            const modal = document.getElementById(`rqModal-${blockId}`);
            if (modal) {
                this.resetForm(blockId);
                document.body.style.overflow = 'hidden';
                modal.classList.add('open');
                modal.setAttribute('aria-hidden', 'false');
            }
        },

        closeModal: function (blockId) {
            const modals = document.querySelectorAll('.rq-modal');
            modals.forEach(modal => {
                modal.classList.remove('open');
                modal.setAttribute('aria-hidden', 'true');
            });
            document.body.style.overflow = '';
            this.resetForm(blockId);
        },

        showProductSummary: function (modalOrBlockId, product) {
            let blockId = modalOrBlockId;
            let modal = null;
            if (typeof modalOrBlockId !== 'string') {
                modal = modalOrBlockId;
                blockId = modal.id.replace('rqModal-', '');
            } else {
                modal = document.getElementById(`rqModal-${blockId}`);
            }

            const listContainer = document.getElementById(`rq-cart-items-list-${blockId}`);
            if (!listContainer) return;

            const vTitle = (product.variants && product.variants[0]) ? product.variants[0].title : '';
            const priceText = window.RqCart ? window.RqCart.formatPrice((product.variants && product.variants[0]) ? product.variants[0].price : 0) : '';

            // Get current quantity from hidden field if it exists, default to 1
            const form = modal?.querySelector('form');
            const qtyInputHidden = form?.querySelector('input[name="quantity"]');
            const currentQty = parseInt(qtyInputHidden?.value) || 1;

            const borderStyle = '1px solid #e1e3e5'; // Fallback border color
            listContainer.innerHTML = `
                <div class="rq-product-summary" style="margin-bottom: 16px; padding: 16px; border: 1px solid #f3f4f6; border-radius: 12px; position: relative; background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.05); transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s ease;">
                    <button class="rq-cart-item-remove" onclick="window.RqUi.resetToEmpty('${blockId}')" title="Remove item" 
                            style="position: absolute; top: 12px; right: 12px; background: #fef2f2; border: none; cursor: pointer; color: #ef4444; padding: 6px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                    <div style="display: flex; align-items: flex-start; gap: 16px; margin-bottom: 16px;">
                        <div style="position: relative; flex-shrink: 0;">
                            <img src="${product.featured_image || ''}" alt="${product.title}" width="70" height="70" style="object-fit: cover; border-radius: 10px; border: 1px solid #f3f4f6; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                        </div>
                        <div class="rq-product-info" style="flex: 1; min-width: 0; padding-top: 2px;">
                            <div class="rq-product-title" style="font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; padding-right: 24px; line-height: 1.4;">${product.title}</div>
                            <div class="rq-product-variant" style="display: inline-block; padding: 2px 8px; background: #f3f4f6; border-radius: 4px; font-size: 11px; font-weight: 600; color: #4b5563; text-transform: uppercase; letter-spacing: 0.5px;">${vTitle !== 'Default Title' ? vTitle : 'Standard'}</div>
                            ${(window.rqGlobalSettings && (window.rqGlobalSettings.hidePriceGlobal || window.rqGlobalSettings.loginToSeePrice)) ? '' : `
                            <div class="rq-product-price" style="font-size: 16px; font-weight: 800; margin-top: 8px; color: #111827; display: flex; align-items: baseline; gap: 4px;">
                                ${priceText}
                                <span style="font-size: 11px; color: #9ca3af; font-weight: 400;">/ item</span>
                            </div>
                            `}
                        </div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 14px; border-top: 1px dashed #e5e7eb;">
                        <span style="font-size: 13px; font-weight: 600; color: #374151;">Request Quantity</span>
                        <div class="rq-cart-item-qty" style="display: flex; align-items: center; gap: 2px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 3px;">
                            <button type="button" class="rq-cart-item-qty-btn" onclick="window.RqUi.updateSingleQty('${blockId}', -1)" 
                                    style="width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background: white; border: 1px solid #e5e7eb; border-radius: 6px; cursor: pointer; color: #374151; font-weight: 700; transition: all 0.2s;">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </button>
                            <input type="number" id="rq-single-qty-input-${blockId}" value="${currentQty}" min="1" 
                                   style="width: 44px; height: 28px; text-align: center; border: none; background: transparent; font-size: 14px; font-weight: 700; color: #111827; -moz-appearance: textfield;"
                                   onchange="window.RqUi.updateSingleQty('${blockId}', 0, this.value)">
                            <button type="button" class="rq-cart-item-qty-btn" onclick="window.RqUi.updateSingleQty('${blockId}', 1)" 
                                    style="width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background: white; border: 1px solid #e5e7eb; border-radius: 6px; cursor: pointer; color: #374151; font-weight: 700; transition: all 0.2s;">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </button>
                        </div>
                    </div>
                </div>

            `;
        },

        updateSingleQty: function (blockId, delta, explicitVal = null) {
            const qtyInput = document.getElementById(`rq-single-qty-input-${blockId}`);
            const form = document.getElementById(`rq-form-${blockId}`);
            const qtyInputHidden = form?.querySelector('input[name="quantity"]');

            if (qtyInput && qtyInputHidden) {
                let newVal = explicitVal !== null ? parseInt(explicitVal) : (parseInt(qtyInput.value) || 1) + delta;
                if (isNaN(newVal) || newVal < 1) newVal = 1;
                qtyInput.value = newVal;
                qtyInputHidden.value = newVal;
            }
        },

        resetToEmpty: function (blockId) {
            const listContainer = document.getElementById(`rq-cart-items-list-${blockId}`);
            if (listContainer) listContainer.innerHTML = '';

            const modal = document.getElementById(`rqModal-${blockId}`);
            if (modal) {
                modal.dataset.isBulk = 'true'; // Switch to bulk mode so it shows empty cart next time
            }

            window.rqCloseModal(blockId);
        },

        rqOpenProductSelector: function (blockId) {
            // Create or get the picker modal element
            let picker = document.getElementById(`rq-picker-${blockId}`);
            if (!picker) {
                picker = document.createElement('div');
                picker.id = `rq-picker-${blockId}`;
                picker.className = 'rq-picker-modal';
                picker.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 10000; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease; pointer-events: none;';

                picker.innerHTML = `
                    <div style="background: white; width: 90%; max-width: 500px; border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.15); overflow: hidden; transform: translateY(20px); transition: transform 0.3s ease;">
                        <div style="padding: 24px; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: center;">
                            <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: #111827;">Add Products</h3>
                            <button onclick="window.RqUi.cancelProductSelector('${blockId}')" style="background: #f3f4f6; border: none; padding: 6px; border-radius: 50%; cursor: pointer; color: #6b7280;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <div style="padding: 24px;">
                            <div style="position: relative; margin-bottom: 16px;">
                                <svg style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #9ca3af;" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                <input type="text" id="rq-prod-search-${blockId}" placeholder="Search products..." 
                                       style="width: 100%; padding: 14px 14px 14px 44px; border: 2px solid #f3f4f6; border-radius: 12px; font-size: 15px; transition: all 0.2s; outline: none;"
                                       oninput="window.RqUi.rqHandleProductSearch(this.value, '${blockId}')"
                                       onfocus="this.style.borderColor='#111827'; this.style.boxShadow='0 0 0 4px rgba(0, 0, 0, 0.1)';"
                                       onblur="this.style.borderColor='#f3f4f6'; this.style.boxShadow='none';">
                            </div>
                            <div id="rq-search-results-${blockId}" style="max-height: 350px; overflow-y: auto; margin: 0 -12px; padding: 0 12px;">
                                <div style="padding: 40px 0; text-align: center; color: #9ca3af;">
                                    <svg style="margin-bottom: 12px; opacity: 0.5;" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                    <p style="margin: 0; font-size: 14px;">Type at least 2 characters to search</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(picker);
            }

            // Show with animation
            setTimeout(() => {
                picker.style.opacity = '1';
                picker.style.pointerEvents = 'auto';
                picker.querySelector('div').style.transform = 'translateY(0)';
                picker.querySelector('input').focus();
            }, 10);
        },

        cancelProductSelector: function (blockId) {
            const picker = document.getElementById(`rq-picker-${blockId}`);
            if (picker) {
                picker.style.opacity = '0';
                picker.style.pointerEvents = 'none';
                picker.querySelector('div').style.transform = 'translateY(20px)';
            }
        },

        rqHandleProductSearch: async function (query, blockId) {
            const resultsContainer = document.getElementById(`rq-search-results-${blockId}`);
            if (!resultsContainer) return;

            if (!query || query.length < 2) {
                resultsContainer.style.display = 'none';
                return;
            }

            try {
                const products = await window.RqApi.searchProducts(query);
                if (products && products.length > 0) {
                    resultsContainer.innerHTML = products.map(p => `
                        <div class="rq-search-result-item" onclick="window.RqUi.rqAddFromSelector('${p.handle}', '${blockId}')" 
                             style="display: flex; align-items: center; gap: 12px; padding: 12px; cursor: pointer; border-radius: 12px; margin-bottom: 8px; transition: all 0.2s; border: 1px solid transparent;"
                             onmouseover="this.style.background='#f9fafb'; this.style.borderColor='#e5e7eb'; this.style.transform='translateX(4px)';"
                             onmouseout="this.style.background='transparent'; this.style.borderColor='transparent'; this.style.transform='none';">
                            <img src="${p.image || ''}" width="50" height="50" style="object-fit: cover; border-radius: 8px; border: 1px solid #f3f4f6;">
                            <div style="flex: 1; overflow: hidden;">
                                <div style="font-size: 14px; font-weight: 700; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px;">${p.title}</div>
                                <div style="font-size: 13px; font-weight: 600; color: #111827;">${window.RqCart.formatPrice(p.price)}</div>
                            </div>
                            <div style="background: #f3f4f6; color: #111827; padding: 6px; border-radius: 8px;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </div>
                        </div>
                    `).join('');
                } else {
                    resultsContainer.innerHTML = '<div style="padding: 40px 0; text-align: center; color: #9ca3af; font-size: 14px;">No products found for "' + query + '"</div>';
                }
                resultsContainer.style.display = 'block';
            } catch (err) {
                console.error("Search failed:", err);
            }
        },

        rqAddFromSelector: async function (handle, blockId) {
            try {
                const product = await window.RqApi.fetchProduct(handle);
                if (product) {
                    const item = {
                        productId: product.id,
                        variantId: product.variants[0].id,
                        title: product.title,
                        variantTitle: product.variants[0].title,
                        price: product.variants[0].price,
                        featured_image: product.featured_image,
                        quantity: 1,
                        handle: handle,
                        sku: product.variants[0].sku || "",
                        vendor: product.vendor || ""
                    };

                    // If it was a single product request, we need to convert to bulk mode
                    const modal = document.getElementById(`rqModal-${blockId}`);
                    if (modal && modal.dataset.isBulk !== 'true') {
                        // Add existing single product to cart first if it's not already there?
                        // Actually, better to just merge everything into RqCart.
                        modal.dataset.isBulk = 'true';
                    }

                    window.RqCart.addItem(item);
                    this.cancelProductSelector(blockId); // Close picker
                    window.RqCart.refreshModalUI(blockId);
                }
            } catch (err) {
                console.error("Failed to add product from selector:", err);
            }
        },

        populateHiddenFields: function (modal, product) {
            const form = modal.querySelector('form');
            if (form) {
                const setVal = (name, val) => {
                    const inp = form.querySelector(`input[name="${name}"]`);
                    if (inp) inp.value = val;
                };
                setVal('productId', product.id);
                setVal('handle', product.handle);
                setVal('variantId', product.variants[0]?.id || '');
                setVal('productTitle', product.title);
                setVal('productUrl', window.location.origin + product.url);
                setVal('variantTitle', product.variants[0]?.title || '');
                setVal('price', (product.variants[0]?.price || 0) / 100.0);
                setVal('productImage', product.featured_image || '');
                setVal('quantity', 1);
            }
        },

        showBulkSummary: function (modalOrBlockId, cart) {
            let blockId = modalOrBlockId;
            let modal = null;
            if (typeof modalOrBlockId !== 'string') {
                modal = modalOrBlockId;
                blockId = modal.id.replace('rqModal-', '');
            } else {
                modal = document.getElementById(`rqModal-${blockId}`);
            }

            const listContainer = document.getElementById(`rq-cart-items-list-${blockId}`);
            if (!listContainer) return;

            const count = cart.reduce((acc, i) => acc + (parseInt(i.quantity) || 0), 0);
            const hidePrice = window.rqGlobalSettings && (window.rqGlobalSettings.hidePriceGlobal || window.rqGlobalSettings.loginToSeePrice);
            const totalText = window.RqCart ? window.RqCart.formatPrice(cart.reduce((acc, i) => acc + (i.price * (parseInt(i.quantity) || 1)), 0)) : '';

            const borderStyle = '1px solid #f3f4f6';
            const settings = window.rqGlobalSettings || {};
            let itemsHtml = '';
            cart.forEach(item => {
                const itemPriceTotal = window.RqCart ? window.RqCart.formatPrice(item.price * (parseInt(item.quantity) || 1)) : '';

                let metadataHtml = '';
                const showSku = settings.showSku === true || settings.showSku === 'true';
                const showVendor = settings.showVendor === true || settings.showVendor === 'true';
                const showNote = settings.showProductNote === true || settings.showProductNote === 'true';

                if (showSku && item.sku) {
                    metadataHtml += `<div class="rq-product-metadata-item"><span>SKU:</span> ${item.sku}</div>`;
                }
                if (showVendor && item.vendor) {
                    metadataHtml += `<div class="rq-product-metadata-item"><span>Vendor:</span> ${item.vendor}</div>`;
                }

                const qtyControlsHtml = (settings.showQuantity !== false && settings.showQuantity !== 'false') ? `
                    <div class="rq-qty-controls">
                        <button onclick="window.RqCart.updateQuantity('${item.variantId}', -1, '${blockId}')" class="rq-qty-btn">−</button>
                        <input type="number" value="${item.quantity}" min="1" 
                               onchange="window.RqCart.updateQuantity('${item.variantId}', 0, '${blockId}', this.value)"
                               class="rq-qty-input">
                        <button onclick="window.RqCart.updateQuantity('${item.variantId}', 1, '${blockId}')" class="rq-qty-btn">+</button>
                    </div>
                ` : `<div class="rq-qty-static">Qty: ${item.quantity}</div>`;

                const noteFieldHtml = showNote ? `
                    <div class="rq-product-note-wrapper">
                        <textarea 
                            placeholder="Add a note for this item..." 
                            onchange="window.RqCart.updateItemNote('${item.variantId}', this.value)"
                            class="rq-product-note-input"
                        >${item.note || ''}</textarea>
                    </div>
                ` : '';

                itemsHtml += `
                    <div class="rq-product-summary">
                        <div class="rq-product-row">
                            <div class="rq-product-img-col">
                                <img src="${item.featured_image || ''}" alt="${item.title}" class="rq-product-img">
                            </div>
                            
                            <div class="rq-product-info-col">
                                <div class="rq-product-title-line">
                                    <span class="rq-product-title">${item.title}</span>
                                    <button class="rq-cart-item-remove-small" onclick="window.RqCart.removeItem('${item.variantId}', '${blockId}')" title="Remove">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                    </button>
                                </div>
                                <div class="rq-product-variant-line">${item.variantTitle && item.variantTitle !== 'Default Title' ? item.variantTitle : 'Standard'}</div>
                                ${metadataHtml}
                                
                                <div class="rq-product-actions-line">
                                    ${qtyControlsHtml}
                                    ${hidePrice ? '' : `<div class="rq-product-price-small">${itemPriceTotal}</div>`}
                                </div>
                            </div>
                        </div>
                        ${noteFieldHtml}
                    </div>
                `;
            });

            listContainer.innerHTML = `
                <div class="rq-bulk-summary-wrapper">
                    <div style="padding-right: 4px;">
                        ${itemsHtml}
                    </div>
                    
                    ${hidePrice ? '' : `
                    <div style="margin-top: 16px; padding: 16px; background: #f9fafb; border-radius: 16px; border: 1px solid #e5e7eb; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <span style="font-size: 14px; color: #6b7280; font-weight: 600;">Estimate Subtotal</span>
                            <span style="font-size: 24px; font-weight: 800; color: #111827; letter-spacing: -0.5px;">${totalText}</span>
                        </div>
                        <div style="height: 1px; background: #e5e7eb; margin: 8px 0;"></div>
                        <p style="font-size: 12px; color: #6b7280; margin: 0; display: flex; align-items: center; gap: 6px; font-weight: 500;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                            Final quote includes applicable taxes and shipping.
                        </p>
                    </div>
                    `}
                </div>
            `;
        },

        buildDynamicForm: function (blockId, formConfig) {
            const container = document.getElementById(`rq-dynamic-form-${blockId}`);
            if (!container || !formConfig || !formConfig.steps) return;

            const formTitle = document.getElementById(`rq-form-title-${blockId}`);
            const formDesc = document.getElementById(`rq-form-desc-${blockId}`);
            if (formTitle) formTitle.innerText = formConfig.title || 'Request Your Quote';
            if (formDesc) formDesc.innerHTML = formConfig.description || "Fill in your details and we'll get back to you shortly";

            const successTitle = document.getElementById(`rq-success-title-${blockId}`);
            const successDesc = document.getElementById(`rq-success-desc-${blockId}`);
            if (successTitle) successTitle.innerText = formConfig.settings?.successTitle || 'Quote Requested Successfully!';
            if (successDesc) successDesc.innerHTML = formConfig.settings?.successMessage || 'Thank you for your request. Our team will review your quote and get back to you shortly.';

            const submitIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;
            const fileIcon = `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`;

            let html = '<div class="rq-single-page-form-container">';

            formConfig.steps.forEach((step, index) => {
                if (step.id === 'step-review') return;

                html += `<div class="rq-step active" style="margin-bottom: 32px;">`;
                if (step.title) {
                    html += `<h3 class="rq-step-title" style="font-size: 18px; font-weight: 800; color: #111827; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f3f4f6; display: flex; align-items: center; gap: 12px;">
                        <span style="background: #111827; color: white; width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px;">${index + 1}</span>
                        ${step.title}
                    </h3>`;
                }

                if (step.description) {
                    html += `<p class="rq-step-description" style="font-size: 14px; color: #6b7280; margin: -4px 0 24px 0; line-height: 1.6; font-weight: 500;">${step.description}</p>`;
                }

                html += `<div class="rq-step-content">`;
                step.fields.forEach(field => {
                    const isFull = field.layoutWidth === 'full' || field.type === 'textarea' || field.type === 'file';
                    const gridSpan = isFull ? 'grid-column: span 2;' : '';

                    html += `<div class="rq-input-group" style="${gridSpan} margin-bottom: 4px;">`;
                    html += `<label style="display: block; font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 6px;">${field.label} ${field.required ? '<span class="rq-required" style="color: #ef4444;">*</span>' : ''}</label>`;

                    const fieldDescription = field.helpText || field.description;
                    if (fieldDescription) {
                        html += `<p class="rq-field-description" style="font-size: 12px; color: #6b7280; margin: -4px 0 10px 0; font-weight: 500; line-height: 1.5;">${fieldDescription}</p>`;
                    }

                    const fieldName = field.id.replace('field-', '');
                    const fieldId = `rq-${fieldName}-${blockId}`;
                    const requiredAttr = field.required ? 'required' : '';

                    let attrs = `${requiredAttr}`;

                    if (field.minLength) attrs += ` minlength="${field.minLength}"`;
                    if (field.maxLength) attrs += ` maxlength="${field.maxLength}"`;

                    if (field.type === 'textarea') {
                        html += `<textarea name="${fieldName}" id="${fieldId}" rows="4" placeholder="${field.placeholder || field.label || 'Enter details...'}" class="rq-form-input" ${attrs}></textarea>`;
                    } else if (field.type === 'file') {
                        const isMultiple = field.allowMultiple || field.id.includes('multiple');
                        const maxFiles = isMultiple ? 3 : 1;
                        const acceptAttr = field.allowedFileTypes ? `accept="${field.allowedFileTypes}"` : 'accept="image/*"';
                        html += `
                            <div class="rq-image-upload-wrapper" id="rq-file-wrapper-${fieldId}" style="margin-top: 4px;">
                                <div class="rq-dropzone" onclick="document.getElementById('${fieldId}').click()" 
                                     style="border: 2px dashed #e5e7eb; border-radius: 16px; padding: 24px 16px; text-align: center; background: #f9fafb; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 12px; transition: all 0.2s;"
                                     onmouseover="this.style.borderColor='#111827'; this.style.background='#f3f4f6';"
                                     onmouseout="this.style.borderColor='#e5e7eb'; this.style.background='#f9fafb';">
                                    <div style="background: #fff; color: #111827; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">${fileIcon}</div>
                                    <div>
                                        <div style="font-weight: 800; font-size: 15px; color: #111827; margin-bottom: 4px;">Upload Files</div>
                                        <div style="font-size: 12px; color: #6b7280; font-weight: 500;">PNG, JPG or PDF up to 5MB (Max ${maxFiles})</div>
                                    </div>
                                    <input type="file" name="${fieldName}" id="${fieldId}" ${acceptAttr} ${requiredAttr} ${isMultiple ? 'multiple' : ''} style="display:none;" onchange="window.RqUi.handleFileSelect(event, '${fieldId}', ${maxFiles})">
                                </div>
                                <div class="rq-file-previews" id="rq-previews-${fieldId}" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 12px; margin-top: 16px;"></div>
                            </div>
                        `;
                    } else {
                        html += `<input type="${field.type === 'email' ? 'email' : (field.type === 'phone' || field.type === 'tel' ? 'tel' : 'text')}" 
                                       name="${fieldName}" id="${fieldId}" placeholder="${field.placeholder || field.label || ''}" 
                                       class="rq-form-input" ${attrs}
                                       style="width: 100%; padding: 14px 16px; border: 2px solid #f3f4f6; border-radius: 12px; font-size: 15px; transition: all 0.2s; outline: none;">`;
                    }
                    html += `<span class="rq-error" id="rq-error-${fieldName}-${blockId}" style="display: block; color: #ef4444; font-size: 12px; margin-top: 4px; min-height: 18px; font-weight: 500;"></span>`;
                    html += `</div>`;
                });
                html += `</div>`;
                html += `</div>`;
            });

            html += `
                <div style="margin-top: 32px; display: flex; justify-content: center;">
                    <button type="button" onclick="rqValidateAndSubmit('${blockId}')" class="rq-submit-btn rq-submit-final" 
                            style="width: 100%; height: 54px; background: #111827; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);"
                            onmouseover="this.style.background='#000000';"
                            onmouseout="this.style.background='#111827';">
                        ${formConfig.settings?.submitButtonText || 'Submit Quote Request'}
                    </button>
                </div>
            `;

            html += '</div>';
            container.innerHTML = html;
        },

        buildProgressSteps: function (blockId, steps) {
            const wrapper = document.querySelector(`#rqModal-${blockId} .rq-progress-steps`);
            if (!wrapper) return;

            let html = '';
            steps.forEach((step, index) => {
                const stepNum = index + 1;
                const isActive = stepNum === 1 ? 'active' : '';
                html += `
                    <div class="rq-progress-step ${isActive}" data-step="${stepNum}">
                        <div class="rq-progress-circle">
                            <span>${stepNum}</span>
                            <svg class="rq-progress-check" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 6L9 17L4 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <span class="rq-progress-label">${step.title}</span>
                    </div>
                `;
                if (stepNum < steps.length) {
                    const lineLeft = `calc(${((2 * index + 1) / (2 * steps.length)) * 100}% + 22px)`;
                    const lineWidth = `calc(${(1 / steps.length) * 100}% - 44px)`;
                    html += `<div class="rq-progress-line" style="left: ${lineLeft}; width: ${lineWidth};"></div>`;
                }
            });
            wrapper.innerHTML = html;
        },

        resetForm: function (blockId) {
            const form = document.getElementById('rq-form-' + blockId);
            if (form) form.reset();

            const errorSpans = document.querySelectorAll(`#rqModal-${blockId} .rq-error`);
            errorSpans.forEach(el => el.innerText = '');

            const formContainer = document.getElementById(`rq-form-container-${blockId}`);
            if (formContainer) formContainer.style.display = 'flex';

            const successSection = document.getElementById('rq-step-success-' + blockId);
            if (successSection) successSection.style.display = 'none';

            if (form) {
                const fileInputs = form.querySelectorAll('input[type="file"]');
                fileInputs.forEach(input => {
                    input._rq_files = [];
                    const previewContainer = document.getElementById(`rq-previews-${input.id}`);
                    if (previewContainer) previewContainer.innerHTML = '';
                });
            }

            const submitBtns = document.querySelectorAll(`#rqModal-${blockId} .rq-submit-btn`);
            submitBtns.forEach(b => {
                b.disabled = false;
            });
        },

        updateProgressIndicator: function (blockId, currentStep) {
            const modal = document.getElementById(`rqModal-${blockId}`);
            if (!modal) return;

            const progressSteps = modal.querySelectorAll('.rq-progress-step');
            const progressLines = modal.querySelectorAll('.rq-progress-line');

            progressSteps.forEach((step, index) => {
                const stepNumber = index + 1;
                step.classList.remove('active', 'completed');
                if (stepNumber < currentStep) {
                    step.classList.add('completed');
                } else if (stepNumber === currentStep) {
                    step.classList.add('active');
                }
            });

            progressLines.forEach((line, index) => {
                const lineStep = index + 1;
                if (lineStep < currentStep) {
                    line.classList.add('completed');
                } else {
                    line.classList.remove('completed');
                }
            });
        },

        showSuccess: function (blockId, formData) {
            const setSuccessText = (id, text) => {
                const el = document.getElementById(`rq-success-${id}-${blockId}`);
                if (el) el.innerText = text || '-';
            };

            const modal = document.getElementById(`rqModal-${blockId}`);
            const isBulk = modal?.dataset.isBulk === 'true';

            if (isBulk) {
                setSuccessText('product', 'Multiple Items from Quote Cart');
                const variantRow = document.getElementById(`rq-success-variant-row-${blockId}`);
                if (variantRow) variantRow.style.display = 'none';
            } else {
                setSuccessText('product', formData.productTitle);
                const variantRow = document.getElementById(`rq-success-variant-row-${blockId}`);
                if (formData.variantTitle && formData.variantTitle !== 'Default Title') {
                    setSuccessText('variant', formData.variantTitle);
                    if (variantRow) variantRow.style.display = 'block';
                } else {
                    if (variantRow) variantRow.style.display = 'none';
                }
            }

            document.getElementById(`rq-form-container-${blockId}`).style.display = 'none';
            const successEl = document.getElementById(`rq-step-success-${blockId}`);
            if (successEl) successEl.style.display = 'flex';

            const progressWrapper = document.querySelector(`#rqModal-${blockId} .rq-progress-wrapper`);
            if (progressWrapper) progressWrapper.style.display = 'none';
        },

        handleFileDrop: function (event, fieldId, maxFiles) {
            event.preventDefault();
            const dropzone = event.currentTarget;
            dropzone.classList.remove('dragover');
            const files = event.dataTransfer.files;
            if (files.length) this.processFiles(files, fieldId, maxFiles);
        },

        handleFileSelect: function (event, fieldId, maxFiles) {
            const files = event.target.files;
            if (files.length) this.processFiles(files, fieldId, maxFiles);
        },

        processFiles: function (fileList, fieldId, maxFiles) {
            const input = document.getElementById(fieldId);
            const previewContainer = document.getElementById(`rq-previews-${fieldId}`);
            if (!input || !previewContainer) return;

            const maxMb = parseFloat(input.dataset.maxMb) || 5;
            let existingFiles = input._rq_files || [];

            for (const file of fileList) {
                if (!file.type.startsWith('image/')) {
                    alert(`File "${file.name}" is not an image.`);
                    continue;
                }
                if (file.size > maxMb * 1024 * 1024) {
                    alert(`File "${file.name}" exceeds the ${maxMb}MB limit.`);
                    continue;
                }
                if (maxFiles === 1) {
                    existingFiles = [file];
                } else {
                    if (existingFiles.length < 3) {
                        const isDup = existingFiles.some(f => f.name === file.name && f.size === file.size);
                        if (!isDup) existingFiles.push(file);
                    } else {
                        alert('Maximum 3 images allowed.');
                        break;
                    }
                }
            }

            input._rq_files = existingFiles;
            this.renderPreviews(fieldId, existingFiles);
            input.value = '';
        },

        renderPreviews: function (fieldId, files) {
            const previewContainer = document.getElementById(`rq-previews-${fieldId}`);
            if (!previewContainer) return;
            previewContainer.innerHTML = '';

            files.forEach((file, index) => {
                const previewItem = document.createElement('div');
                previewItem.className = 'rq-preview-item';
                previewItem.style.cssText = 'position: relative; width: 100%; aspect-ratio: 1; border-radius: 12px; overflow: hidden; border: 2px solid #f3f4f6; box-shadow: 0 4px 10px rgba(0,0,0,0.05); background: #fff;';

                const removeBtn = document.createElement('button');
                removeBtn.className = 'rq-preview-remove';
                removeBtn.type = 'button';
                removeBtn.style.cssText = 'position: absolute; top: 6px; right: 6px; z-index: 10; background: rgba(255,255,255,0.9); backdrop-filter: blur(4px); border: none; cursor: pointer; color: #ef4444; padding: 5px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); transition: all 0.2s;';
                removeBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
                removeBtn.onmouseover = () => { removeBtn.style.background = '#ef4444'; removeBtn.style.color = '#fff'; };
                removeBtn.onmouseout = () => { removeBtn.style.background = 'rgba(255,255,255,0.9)'; removeBtn.style.color = '#ef4444'; };
                removeBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.removeFile(fieldId, index);
                };

                const img = document.createElement('img');
                img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';

                const reader = new FileReader();
                reader.onload = (e) => {
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);

                previewItem.appendChild(removeBtn);
                previewItem.appendChild(img);
                previewContainer.appendChild(previewItem);
            });
        },

        removeFile: function (fieldId, index) {
            const input = document.getElementById(fieldId);
            if (!input || !input._rq_files) return;
            input._rq_files.splice(index, 1);
            input.value = '';
            this.renderPreviews(fieldId, input._rq_files);
        }
    };
})();
