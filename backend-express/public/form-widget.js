class CustomQuoteForm extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        const shop = this.getAttribute('shop');
        if (!shop) {
            console.error('B2B Quote Form: missing "shop" attribute');
            return;
        }

        try {
            // Use Shopify App Proxy route assuming it's configured as /apps/proxy
            const response = await fetch(`/apps/proxy/forms?shop=${encodeURIComponent(shop)}`);
            if (!response.ok) throw new Error('Failed to load form configuration');

            const result = await response.json();
            const config = result.data;

            this.renderForm(config);
        } catch (error) {
            console.error('B2B Quote Form Error:', error);
            this.shadowRoot.innerHTML = `<p style="color: red;">Error loading quote form.</p>`;
        }
    }

    renderForm(config) {
        let currentStep = 0;
        const formData = {};

        const renderSteps = () => {
            // In a real implementation this would generate the HTML matching polaris or merchant theme
            // Including multuple steps with Next/Back buttons and parsing config.fields

            this.shadowRoot.innerHTML = `
                <style>
                    /* Basic styling for the shadow DOM form */
                    .b2b-form-container { font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px; }
                    .b2b-step { display: none; }
                    .b2b-step.active { display: block; }
                    .b2b-field { margin-bottom: 15px; }
                    .b2b-field label { display: block; margin-bottom: 5px; font-weight: bold; }
                    .b2b-field input, .b2b-field select, .b2b-field textarea { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
                    .b2b-buttons { margin-top: 20px; display: flex; justify-content: space-between; }
                    button { padding: 10px 15px; background: #000; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
                    button:disabled { opacity: 0.5; cursor: not-allowed; }
                </style>
                <div class="b2b-form-container">
                    <h3>${config.title || 'Request a Quote'}</h3>
                    <form id="b2b-quote-form">
                        ${config.steps.map((step, index) => `
                            <div class="b2b-step ${index === 0 ? 'active' : ''}" id="step-${index}">
                                <h4>${step.title}</h4>
                                ${step.fields.map(field => this.renderField(field)).join('')}
                            </div>
                        `).join('')}
                        <div class="b2b-buttons">
                            <button type="button" id="prev-btn" style="display: none;">Previous</button>
                            ${config.steps.length > 1 ? '<button type="button" id="next-btn">Next</button>' : ''}
                            <button type="submit" id="submit-btn" style="${config.steps.length > 1 ? 'display: none;' : ''}">${config.settings?.submitButtonText || 'Submit'}</button>
                        </div>
                    </form>
                    <div id="b2b-message" style="display: none; margin-top: 15px; padding: 10px; border-radius: 4px;"></div>
                </div>
            `;

            this.attachEventListeners(config, formData);
        };

        renderSteps();
    }

    renderField(field) {
        let inputHtml = '';
        const requiredAttr = field.required ? 'required' : '';
        const commonAttrs = `name="${field.id}" ${requiredAttr}`;

        switch (field.type) {
            case 'textarea':
                inputHtml = `<textarea ${commonAttrs} rows="4"></textarea>`;
                break;
            case 'select':
                inputHtml = `<select ${commonAttrs}>
                    ${(field.options || []).map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                </select>`;
                break;
            case 'file':
                let accept = field.allowedFileTypes || '';
                if (field.allowedImageFormats && field.allowedImageFormats.length > 0) {
                    const formats = field.allowedImageFormats.join(',');
                    accept = accept ? `${formats},${accept}` : formats;
                }
                if (!accept) accept = 'image/*';
                inputHtml = `<input type="file" ${commonAttrs} ${field.allowMultiple ? 'multiple' : ''} accept="${accept}" />`;
                break;
            default: // text, email, phone
                inputHtml = `<input type="${field.type === 'phone' ? 'tel' : field.type}" ${commonAttrs} />`;
        }

        return `
            <div class="b2b-field">
                <label>${field.label} ${field.required ? '*' : ''}</label>
                ${inputHtml}
            </div>
        `;
    }

    attachEventListeners(config, formData) {
        const form = this.shadowRoot.getElementById('b2b-quote-form');
        // Pagination Logic (Simplified)
        let currentStepId = 0;
        const steps = this.shadowRoot.querySelectorAll('.b2b-step');
        const nextBtn = this.shadowRoot.getElementById('next-btn');
        const prevBtn = this.shadowRoot.getElementById('prev-btn');
        const submitBtn = this.shadowRoot.getElementById('submit-btn');

        const updatePagination = () => {
            steps.forEach((s, idx) => s.classList.toggle('active', idx === currentStepId));
            if (prevBtn) prevBtn.style.display = currentStepId > 0 ? 'block' : 'none';

            if (currentStepId < steps.length - 1) {
                if (nextBtn) nextBtn.style.display = 'block';
                submitBtn.style.display = 'none';
            } else {
                if (nextBtn) nextBtn.style.display = 'none';
                submitBtn.style.display = 'block';
            }
        };

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (form.checkValidity()) {
                    currentStepId++;
                    updatePagination();
                } else {
                    form.reportValidity();
                }
            });
        }
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                currentStepId--;
                updatePagination();
            });
        }

        // Submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Gather custom data dynamically
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                if (input.name) {
                    formData[input.name] = input.value;
                }
            });

            // Standard payload expects customerEmail, etc. We'll map them if the merchant used standard names
            // Or just send it all as customData for the backend to process
            const msgDiv = this.shadowRoot.getElementById('b2b-message');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Uploading...';

            let customImages = [];

            // Check for files to upload
            const fileInputs = form.querySelectorAll('input[type="file"]');
            for (const input of fileInputs) {
                if (input.files.length > 0) {
                    const formDataUpload = new FormData();
                    for (let i = 0; i < input.files.length; i++) {
                        formDataUpload.append('images', input.files[i]);
                    }

                    try {
                        const uploadRes = await fetch('/apps/proxy/quotes/upload', {
                            method: 'POST',
                            body: formDataUpload
                        });
                        if (uploadRes.ok) {
                            const uploadData = await uploadRes.json();
                            customImages = customImages.concat(uploadData.data.urls);
                        }
                    } catch (uploadErr) {
                        console.error('File upload failed:', uploadErr);
                    }
                }
            }

            submitBtn.textContent = 'Submitting...';

            try {
                const payload = {
                    shop: this.getAttribute('shop'),
                    customData: formData,
                    customImages: customImages, // Include the uploaded image URLs
                    customerEmail: formData['email'] || 'custom-form@example.com',
                    customerName: formData['name'] || 'Customer',
                };

                const response = await fetch('/apps/proxy/quotes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error('Failed to submit quote');

                msgDiv.style.display = 'block';
                msgDiv.style.background = '#d4edda';
                msgDiv.style.color = '#155724';
                msgDiv.textContent = config.settings?.successMessage || 'Form submitted successfully.';

                form.reset();
                currentStepId = 0;
                updatePagination();
            } catch (err) {
                msgDiv.style.display = 'block';
                msgDiv.style.background = '#f8d7da';
                msgDiv.style.color = '#721c24';
                msgDiv.textContent = 'Error: ' + err.message;
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = config.settings?.submitButtonText || 'Submit';
            }
        });
    }
}

customElements.define('b2b-quote-form', CustomQuoteForm);
