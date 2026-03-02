(function () {
    window.RqUi = {
        openModal: function (blockId) {
            const modal = document.getElementById(`rqModal-${blockId}`);
            if (modal) {
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
        },

        showProductSummary: function (modal, product) {
            let hero = modal.querySelector('.rq-product-hero');
            if (!hero) {
                const form = modal.querySelector('form');
                if (form) {
                    hero = document.createElement('div');
                    hero.className = 'rq-product-hero';
                    form.insertBefore(hero, form.firstChild);
                }
            }

            if (!hero) return;

            let summary = hero.querySelector('.rq-product-summary');
            if (summary) {
                summary.style.display = 'flex';
                const img = summary.querySelector('img');
                if (img) {
                    if (product.featured_image) {
                        img.src = product.featured_image;
                        img.style.display = 'block';
                    } else {
                        img.style.display = 'none';
                    }
                }
                const titleEl = summary.querySelector('.rq-product-title');
                if (titleEl) titleEl.innerText = product.title;

                const variantEl = summary.querySelector('.rq-product-variant');
                const vTitle = (product.variants && product.variants[0]) ? product.variants[0].title : '';
                if (variantEl) {
                    if (vTitle && vTitle !== 'Default Title') {
                        variantEl.innerText = vTitle;
                        variantEl.style.display = 'block';
                    } else {
                        variantEl.style.display = 'none';
                    }
                }
            } else {
                summary = document.createElement('div');
                summary.className = 'rq-product-summary';
                const imgSrc = product.featured_image || '';
                const imgDisp = imgSrc ? 'block' : 'none';
                const vTitle = (product.variants && product.variants[0]) ? product.variants[0].title : '';
                const vDisp = (vTitle && vTitle !== 'Default Title') ? 'block' : 'none';

                summary.innerHTML = `
                     <img src="${imgSrc}" alt="${product.title}" width="60" height="60" style="display: ${imgDisp}">
                     <div class="rq-product-info">
                         <span class="rq-product-title">${product.title}</span>
                         <span class="rq-product-variant" style="display: ${vDisp}">${vTitle}</span>
                     </div>
                 `;
                hero.prepend(summary);
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
                setVal('productTitle', product.title);
                setVal('productUrl', window.location.origin + product.url);
                setVal('variantTitle', product.variants[0]?.title || '');
            }
        },

        showBulkSummary: function (modal, cart) {
            let hero = modal.querySelector('.rq-product-hero');
            if (!hero) {
                const form = modal.querySelector('form');
                if (form) {
                    hero = document.createElement('div');
                    hero.className = 'rq-product-hero';
                    form.insertBefore(hero, form.firstChild);
                }
            }
            if (!hero) return;

            const count = cart.reduce((acc, i) => acc + i.quantity, 0);
            hero.innerHTML = `
                <div class="rq-product-summary" style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                    <div style="display: flex; align-items: center;">
                       <div style="background: var(--rq-accent); color: white; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
                       </div>
                        <div class="rq-product-info">
                            <span class="rq-product-title">Bulk Quote Request</span>
                            <span class="rq-product-variant">${cart.length} products, ${count} total items</span>
                        </div>
                    </div>
                    <div>
                        <button type="button" onclick="window.RqCart.openCart()" style="background: none; border: 1px solid #ccc; font-weight: bold; border-radius: 4px; padding: 6px 12px; font-size: 12px; cursor: pointer; color: var(--rq-accent);">View</button>
                    </div>
                </div>
            `;
        },

        buildDynamicForm: function (blockId, formConfig) {
            const container = document.getElementById(`rq-dynamic-form-${blockId}`);
            if (!container || !formConfig || !formConfig.steps) return;

            // Define icons used in the input fields
            const emailIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
            const phoneIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
            const backIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
            const nextIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
            const submitIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

            let html = '';

            formConfig.steps.forEach((step, index) => {
                const stepNum = index + 1;
                const isLastStep = stepNum === formConfig.steps.length;
                const isActive = stepNum === 1 ? 'active' : '';

                html += `<div id="rq-step-${stepNum}-${blockId}" class="rq-step ${isActive}">`;
                html += `<div class="rq-step-content">`;

                // Add fields
                if (step.id !== "step-review") {
                    step.fields.forEach(field => {
                        const layoutClass = field.layoutWidth === 'half' ? ' rq-col-half' : '';
                        html += `<div class="rq-input-group${layoutClass}" data-field-id="${field.id}">`;
                        html += `<label>${field.label} ${field.required ? '<span class="rq-required">*</span>' : ''}</label>`;

                        // We extract name from field ID, e.g. "field-fname" -> "fname"
                        const fieldName = field.id.replace('field-', '');
                        const fieldId = `rq-${fieldName}-${blockId}`;
                        const requiredAttr = field.required ? 'required' : '';

                        // Build validation attributes
                        let attrs = requiredAttr;
                        if (field.minLength) attrs += ` minlength="${field.minLength}"`;
                        if (field.maxLength) attrs += ` maxlength="${field.maxLength}"`;
                        if (field.validationRegex) attrs += ` pattern="${field.validationRegex}"`;
                        if (field.validationMessage) attrs += ` data-val-msg="${field.validationMessage}"`;

                        if (field.type === 'email') {
                            html += `<div class="rq-input-icon">${emailIcon}<input type="email" name="${fieldName}" id="${fieldId}" ${attrs}></div>`;
                        } else if (field.type === 'phone') {
                            html += `<div class="rq-input-icon">${phoneIcon}<input type="tel" name="${fieldName}" id="${fieldId}" placeholder="10 digits" oninput="this.value = this.value.replace(/[^0-9]/g, '');" ${attrs}></div>`;
                        } else if (field.type === 'number') {
                            html += `<input type="number" name="${fieldName}" id="${fieldId}" onkeydown="return !['e','E','+','-'].includes(event.key)" oninput="this.value = this.value.replace(/[^0-9]/g, '');" ${attrs}>`;
                        } else if (field.type === 'textarea') {
                            html += `<textarea name="${fieldName}" id="${fieldId}" rows="5" placeholder="Tell us more about your requirements..." ${attrs}></textarea>`;
                            if (field.maxLength) html += `<small class="rq-char-count">Max ${field.maxLength} characters</small>`;
                        } else if (field.type === 'file') {
                            const acceptAttr = field.allowedFileTypes ? `accept="${field.allowedFileTypes}"` : '';
                            const maxMbAttr = field.maxFileSizeMB ? `data-max-mb="${field.maxFileSizeMB}"` : '';
                            html += `<input type="file" name="${fieldName}" id="${fieldId}" ${acceptAttr} ${maxMbAttr} ${requiredAttr}>`;
                            if (field.allowedFileTypes || field.maxFileSizeMB) {
                                html += `<small class="rq-file-hints" style="font-size: 11px; color: #666; display: block; margin-top: 4px;">`;
                                if (field.allowedFileTypes) html += `Allowed: ${field.allowedFileTypes}. `;
                                if (field.maxFileSizeMB) html += `Max: ${field.maxFileSizeMB}MB.`;
                                html += `</small>`;
                            }
                        } else {
                            if (fieldName === 'pincode' || field.validationRegex === '^[0-9]+$') {
                                html += `<input type="text" name="${fieldName}" id="${fieldId}" oninput="this.value = this.value.replace(/[^0-9]/g, '');" ${attrs}>`;
                            } else {
                                html += `<input type="text" name="${fieldName}" id="${fieldId}" ${attrs}>`;
                            }
                        }

                        html += `<span class="rq-error" id="rq-error-${fieldName}-${blockId}"></span>`;
                        html += `</div>`;
                    });
                } else {
                    // It's the Review step, just generate the exact same review layout
                    html += `
                        <div class="rq-review-container">
                            <h3 class="rq-review-main-title">Review Your Details</h3>
                            <div class="rq-review-grid">
                                <div class="rq-review-card">
                                    <div class="rq-card-header">
                                        <div class="rq-card-icon">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                        </div>
                                        <h4>Contact Info</h4>
                                    </div>
                                    <div class="rq-card-content"><p id="rq-review-contact-${blockId}" class="rq-review-text"></p></div>
                                </div>
                                <div class="rq-review-card">
                                    <div class="rq-card-header">
                                        <div class="rq-card-icon">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                        </div>
                                        <h4>Shipping Address</h4>
                                    </div>
                                    <div class="rq-card-content"><p id="rq-review-address-${blockId}" class="rq-review-text"></p></div>
                                </div>
                                <div class="rq-review-card">
                                    <div class="rq-card-header">
                                        <div class="rq-card-icon">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                        </div>
                                        <h4>Additional Message</h4>
                                    </div>
                                    <div class="rq-card-content"><p id="rq-review-message-${blockId}" class="rq-review-text"></p></div>
                                </div>
                            </div>
                        </div>
                    `;
                }

                html += `</div>`; // Close .rq-step-content

                // Add button groups
                html += `<div class="rq-btn-group" ${stepNum === 1 ? 'style="display: flex; justify-content: flex-end;"' : ''}>`;
                if (stepNum > 1) {
                    html += `<button type="button" onclick="rqPrevStep('${blockId}', ${stepNum})" class="rq-submit-btn rq-back-btn">${backIcon}Back</button>`;
                }

                if (isLastStep) {
                    html += `<button type="button" onclick="rqValidateAndSubmit('${blockId}')" class="rq-submit-btn rq-submit-final">${submitIcon}${formConfig.settings?.submitButtonText || 'Submit Quote'}</button>`;
                } else if (stepNum === formConfig.steps.length - 1) {
                    html += `<button type="button" onclick="rqNextStep('${blockId}', ${stepNum})" class="rq-submit-btn">Review Info${nextIcon}</button>`;
                } else {
                    html += `<button type="button" onclick="rqNextStep('${blockId}', ${stepNum})" class="rq-submit-btn">Continue${nextIcon}</button>`;
                }
                html += `</div>`; // .rq-btn-group

                html += `</div>`; // .rq-step
            });

            container.innerHTML = html;

            // Rebuild progress steps
            this.buildProgressSteps(blockId, formConfig.steps);
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
                    html += `<div class="rq-progress-line"></div>`;
                }
            });
            wrapper.innerHTML = html;
        },

        resetForm: function (blockId) {
            const form = document.getElementById('rq-form-' + blockId);
            if (form) form.reset();

            const errorSpans = document.querySelectorAll(`#rq-form-${blockId} .rq-error`);
            errorSpans.forEach(el => el.innerText = '');

            const steps = document.querySelectorAll(`#rq-step-input-${blockId} .rq-step`);
            steps.forEach(s => s.classList.remove('active'));
            const firstStep = document.getElementById(`rq-step-1-${blockId}`);
            if (firstStep) firstStep.classList.add('active');

            this.updateProgressIndicator(blockId, 1);

            const progressWrapper = document.querySelector(`#rqModal-${blockId} .rq-progress-wrapper`);
            if (progressWrapper) progressWrapper.style.display = 'block';

            document.getElementById('rq-step-success-' + blockId).style.display = 'none';
            document.getElementById('rq-step-input-' + blockId).style.display = 'block';

            const nextBtns = document.querySelectorAll(`#rq-step-input-${blockId} .rq-submit-btn`);
            nextBtns.forEach(b => {
                b.disabled = false;
                if (b.onclick.toString().includes('rqNextStep')) {
                    const svg = b.querySelector('svg');
                    b.innerHTML = '';

                    let btnText = 'Continue';
                    if (b.getAttribute('onclick') && b.getAttribute('onclick').includes(', 3)')) {
                        btnText = 'Review Info';
                    }

                    b.appendChild(document.createTextNode(btnText));
                    if (svg) b.appendChild(svg);
                } else if (b.onclick.toString().includes('rqValidateAndSubmit')) {
                    const svg = b.querySelector('svg');
                    b.innerHTML = '';
                    if (svg) b.appendChild(svg);
                    b.appendChild(document.createTextNode('Submit Quote'));
                }
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
                const pTitle = formData.productTitle;
                const vTitle = formData.variantTitle;

                setSuccessText('product', pTitle);

                const variantRow = document.getElementById(`rq-success-variant-row-${blockId}`);
                if (vTitle && vTitle !== 'Default Title') {
                    setSuccessText('variant', vTitle);
                    if (variantRow) variantRow.style.display = 'block';
                } else {
                    if (variantRow) variantRow.style.display = 'none';
                }
            }

            setSuccessText('quantity', formData.quantity);
            setSuccessText('fname', formData.firstName);
            setSuccessText('lname', formData.lastName);
            setSuccessText('email', formData.email);
            setSuccessText('phone', formData.phone);
            setSuccessText('message', formData.message);

            document.getElementById(`rq-step-input-${blockId}`).style.display = 'none';
            const successEl = document.getElementById(`rq-step-success-${blockId}`);
            successEl.style.display = 'block';

            // Hide progress indicator on success
            const progressWrapper = document.querySelector(`#rqModal-${blockId} .rq-progress-wrapper`);
            if (progressWrapper) progressWrapper.style.display = 'none';
        }
    };
})();
