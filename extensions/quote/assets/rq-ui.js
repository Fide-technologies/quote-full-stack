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
                <div class="rq-product-summary">
                   <div style="background: var(--rq-accent); color: white; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
                   </div>
                    <div class="rq-product-info">
                        <span class="rq-product-title">Bulk Quote Request</span>
                        <span class="rq-product-variant">${cart.length} products, ${count} total items</span>
                    </div>
                </div>
            `;
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
