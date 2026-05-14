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
                const priceEl = summary.querySelector('.rq-product-price');
                if (priceEl && window.RqCart) {
                    priceEl.innerText = window.RqCart.formatPrice((product.variants && product.variants[0]) ? product.variants[0].price : 0);
                }
            } else {
                summary = document.createElement('div');
                summary.className = 'rq-product-summary';
                const imgSrc = product.featured_image || '';
                const imgDisp = imgSrc ? 'block' : 'none';
                const vTitle = (product.variants && product.variants[0]) ? product.variants[0].title : '';
                const vDisp = (vTitle && vTitle !== 'Default Title') ? 'block' : 'none';
                const priceText = window.RqCart ? window.RqCart.formatPrice((product.variants && product.variants[0]) ? product.variants[0].price : 0) : '';

                summary.innerHTML = `
                      <img src="${imgSrc}" alt="${product.title}" style="display: ${imgDisp}; width: 64px; height: 64px; min-width: 64px; border-radius: 8px; object-fit: cover; border: 2px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); flex-shrink: 0;">
                      <div class="rq-product-info" style="margin-left: 16px;">
                          <span class="rq-product-title" style="font-weight: 700; font-size: 16px;">${product.title}</span>
                          <span class="rq-product-variant" style="display: ${vDisp}; font-size: 13px; color: #6d7175;">${vTitle}</span>
                          <span class="rq-product-price" style="display: block; font-size: 15px; color: var(--rq-accent); font-weight: 700; margin-top: 4px;">${priceText}</span>
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
                setVal('handle', product.handle);
                setVal('variantId', product.variants[0]?.id || '');
                setVal('productTitle', product.title);
                setVal('productUrl', window.location.origin + product.url);
                setVal('variantTitle', product.variants[0]?.title || '');
                setVal('price', (product.variants[0]?.price || 0) / 100.0);
                setVal('productImage', product.featured_image || '');
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
            const totalText = window.RqCart ? window.RqCart.formatPrice(cart.reduce((acc, i) => acc + (i.price * i.quantity), 0)) : '';

            hero.innerHTML = `
                <div class="rq-product-summary" style="display: flex; align-items: center; justify-content: space-between; width: 100%; max-width: 650px; margin: 0 auto 24px;">
                    <div style="display: flex; align-items: center; flex: 1;">
                       <div style="background: var(--rq-accent); color: white; width: 48px; height: 48px; min-width: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 16px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);">
                             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
                       </div>
                        <div class="rq-product-info">
                            <span class="rq-product-title" style="font-size: 17px; font-weight: 800; color: #1a1a1b;">Bulk Quote Request</span>
                            <span class="rq-product-variant" style="font-size: 14px; margin-top: 1px;">${cart.length} products, ${count} total items</span>
                            <span class="rq-product-price" style="display: block; font-size: 15px; color: var(--rq-accent); font-weight: 700; margin-top: 4px;">Total Estimate: ${totalText}</span>
                        </div>
                    </div>
                    <div style="margin-left: 20px;">
                        <button type="button" onclick="window.RqCart.openCart()" style="background: #fff; border: 2px solid #e1e3e5; font-weight: 700; border-radius: 8px; padding: 8px 16px; font-size: 13px; cursor: pointer; color: #1a1a1b; transition: all 0.2s ease;">View Items</button>
                    </div>
                </div>
            `;
        },

        buildDynamicForm: function (blockId, formConfig) {
            const container = document.getElementById(`rq-dynamic-form-${blockId}`);
            if (!container || !formConfig || !formConfig.steps) return;

            const reviewStep = formConfig.steps.find(s => s.id === 'step-review');
            const otherSteps = formConfig.steps.filter(s => s.id !== 'step-review');
            if (reviewStep) {
                formConfig.steps = [...otherSteps, reviewStep];
            } else {
                formConfig.steps.push({ id: 'step-review', title: 'Review', fields: [] });
            }

            const emailIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
            const phoneIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
            const backIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
            const nextIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
            const submitIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
            const fileIcon = `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`;

            let html = '';

            formConfig.steps.forEach((step, index) => {
                const stepNum = index + 1;
                const isLastStep = stepNum === formConfig.steps.length;
                const isActive = stepNum === 1 ? 'active' : '';

                html += `<div id="rq-step-${stepNum}-${blockId}" class="rq-step ${isActive}">`;
                html += `<div class="rq-step-content">`;

                if (step.id !== "step-review") {
                    step.fields.forEach(field => {
                        const layoutClass = field.layoutWidth === 'half' ? ' rq-col-half' : '';
                        html += `<div class="rq-input-group${layoutClass}" data-field-id="${field.id}">`;
                        html += `<label>${field.label} ${field.required ? '<span class="rq-required">*</span>' : ''}</label>`;

                        const fieldName = field.id.replace('field-', '');
                        const fieldId = `rq-${fieldName}-${blockId}`;
                        const requiredAttr = field.required ? 'required' : '';

                        let attrs = requiredAttr;
                        if (field.minLength) attrs += ` minlength="${field.minLength}"`;
                        if (field.maxLength) attrs += ` maxlength="${field.maxLength}"`;
                        if (field.validationRegex) attrs += ` pattern="${field.validationRegex}"`;
                        if (field.validationMessage) attrs += ` data-val-msg="${field.validationMessage}"`;

                        if (field.type === 'email') {
                            html += `<div class="rq-input-icon">${emailIcon}<input type="email" name="${fieldName}" id="${fieldId}" ${attrs}></div>`;
                        } else if (field.type === 'phone') {
                            const placeholderStr = field.maxLength ? `Max ${field.maxLength} digits` : '10 digits';
                            html += `<div class="rq-input-icon">${phoneIcon}<input type="tel" name="${fieldName}" id="${fieldId}" placeholder="${placeholderStr}" oninput="this.value = this.value.replace(/[^0-9]/g, '');" ${attrs}></div>`;
                        } else if (field.type === 'number') {
                            html += `<input type="text" inputmode="numeric" name="${fieldName}" id="${fieldId}" oninput="this.value = this.value.replace(/[^0-9]/g, '');" ${attrs}>`;
                        } else if (field.type === 'textarea') {
                            html += `<textarea name="${fieldName}" id="${fieldId}" rows="5" placeholder="Tell us more about your requirements..." ${attrs}></textarea>`;
                            if (field.maxLength) html += `<small class="rq-char-count">Max ${field.maxLength} characters</small>`;
                        } else if (field.type === 'file') {
                            const isMultiple = field.allowMultiple || field.isMultiple || field.id.includes('multiple') || (field.label && field.label.toLowerCase().includes('multiple'));
                            const maxFiles = isMultiple ? 3 : 1;
                            const acceptAttr = field.allowedFileTypes ? `accept="${field.allowedFileTypes}"` : 'accept="image/*"';
                            const maxMbAttr = field.maxFileSizeMB ? `data-max-mb="${field.maxFileSizeMB}"` : 'data-max-mb="5"';

                            html += `
                                <div class="rq-image-upload-wrapper" id="rq-file-wrapper-${fieldId}">
                                    <div class="rq-dropzone" onclick="document.getElementById('${fieldId}').click()" 
                                         ondragover="event.preventDefault(); this.classList.add('dragover')" 
                                         ondragleave="this.classList.remove('dragover')"
                                         ondrop="window.RqUi.handleFileDrop(event, '${fieldId}', ${maxFiles})">
                                        <div class="rq-dropzone-icon">${fileIcon}</div>
                                        <div class="rq-dropzone-text">Click to upload or drag and drop</div>
                                        <div class="rq-dropzone-subtext">${field.allowedFileTypes || 'Images only'} (Max ${maxFiles} file${maxFiles > 1 ? 's' : ''}, ${field.maxFileSizeMB || '5'}MB each)</div>
                                        <input type="file" name="${fieldName}" id="${fieldId}" ${acceptAttr} ${maxMbAttr} ${requiredAttr} ${isMultiple ? 'multiple' : ''} style="display:none;" onchange="window.RqUi.handleFileSelect(event, '${fieldId}', ${maxFiles})">
                                    </div>
                                    <div class="rq-file-previews" id="rq-previews-${fieldId}"></div>
                                </div>
                            `;
                        } else if (field.type === 'price') {
                            html += `<div class="rq-input-currency"><span class="rq-currency-symbol">$</span><input type="number" name="${fieldName}" id="${fieldId}" step="0.01" min="0" placeholder="0.00" ${attrs}></div>`;
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
                    html += `
                        <div class="rq-review-container">
                            <h3 class="rq-review-main-title">Review Your Request</h3>
                            <div class="rq-items-review-list" id="rq-review-items-${blockId}"></div>
                            <div id="rq-review-custom-fields-${blockId}" class="rq-custom-fields-review"></div>
                        </div>
                    `;
                }

                html += `</div>`; 

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
                html += `</div>`;

                html += `</div>`;
            });

            container.innerHTML = html;
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

            const errorSpans = document.querySelectorAll(`#rq-form-${blockId} .rq-error`);
            errorSpans.forEach(el => el.innerText = '');

            const steps = document.querySelectorAll(`#rq-step-input-${blockId} .rq-step`);
            steps.forEach(s => s.classList.remove('active'));
            const firstStep = document.getElementById(`rq-step-1-${blockId}`);
            if (firstStep) firstStep.classList.add('active');

            this.updateProgressIndicator(blockId, 1);

            const progressWrapper = document.querySelector(`#rqModal-${blockId} .rq-progress-wrapper`);
            if (progressWrapper) progressWrapper.style.display = 'block';

            const successSection = document.getElementById('rq-step-success-' + blockId);
            if (successSection) successSection.style.display = 'none';
            const inputSection = document.getElementById('rq-step-input-' + blockId);
            if (inputSection) inputSection.style.display = 'block';

            if (form) {
                const fileInputs = form.querySelectorAll('input[type="file"]');
                fileInputs.forEach(input => {
                    input._rq_files = [];
                    const previewContainer = document.getElementById(`rq-previews-${input.id}`);
                    if (previewContainer) previewContainer.innerHTML = '';
                });
            }

            const nextBtns = document.querySelectorAll(`#rq-step-input-${blockId} .rq-submit-btn`);
            nextBtns.forEach(b => {
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

            setSuccessText('quantity', formData.quantity);
            setSuccessText('fname', formData.firstName);
            setSuccessText('lname', formData.lastName);
            setSuccessText('email', formData.email);
            setSuccessText('phone', formData.phone);
            setSuccessText('message', formData.message);

            document.getElementById(`rq-step-input-${blockId}`).style.display = 'none';
            const successEl = document.getElementById(`rq-step-success-${blockId}`);
            if (successEl) successEl.style.display = 'block';

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
                const reader = new FileReader();
                const previewItem = document.createElement('div');
                previewItem.className = 'rq-preview-item';

                const removeBtn = document.createElement('button');
                removeBtn.className = 'rq-preview-remove';
                removeBtn.type = 'button';
                removeBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
                removeBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.removeFile(fieldId, index);
                };

                const img = document.createElement('img');
                reader.onload = (e) => { img.src = e.target.result; };
                reader.readAsDataURL(file);

                const filename = document.createElement('div');
                filename.className = 'rq-preview-filename';
                filename.innerText = file.name;

                previewItem.appendChild(img);
                previewItem.appendChild(removeBtn);
                previewItem.appendChild(filename);
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
