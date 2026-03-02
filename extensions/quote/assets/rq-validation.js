(function () {
    window.RqValidation = {
        clearError: function (id, blockId) {
            const el = document.getElementById('rq-error-' + id + '-' + blockId);
            if (el) el.innerText = '';
        },

        validateStep: function (blockId, stepNum) {
            let isValid = true;
            const stepContainer = document.getElementById(`rq-step-${stepNum}-${blockId}`);
            if (!stepContainer) return isValid;

            const inputs = stepContainer.querySelectorAll('input, textarea, select');

            inputs.forEach(input => {
                const fieldName = input.name;
                this.clearError(fieldName, blockId);

                const errSpan = document.getElementById(`rq-error-${fieldName}-${blockId}`);
                let fieldValid = true;
                let errMsg = '';

                if (input.required && !input.value.trim() && input.type !== 'file') {
                    fieldValid = false;
                    errMsg = 'This field is required.';
                } else if (input.required && input.type === 'file' && !input.files.length) {
                    fieldValid = false;
                    errMsg = 'Please select a file.';
                } else if (input.value.trim() || input.files?.length) {

                    // Advanced Validations Handlers
                    const patternAttr = input.getAttribute('pattern');
                    const valMsgAttr = input.getAttribute('data-val-msg') || 'Invalid format.';
                    const minLenAttr = input.getAttribute('minlength');
                    const maxLenAttr = input.getAttribute('maxlength');
                    const maxMbAttr = input.getAttribute('data-max-mb');

                    // Regex validation
                    if (patternAttr && input.type !== 'file') {
                        const regex = new RegExp(patternAttr);
                        if (!regex.test(input.value.trim())) {
                            fieldValid = false;
                            errMsg = valMsgAttr;
                        }
                    }

                    // Length validation
                    if (fieldValid && minLenAttr && input.value.trim().length < parseInt(minLenAttr)) {
                        fieldValid = false;
                        errMsg = `Must be at least ${minLenAttr} characters.`;
                    }
                    if (fieldValid && maxLenAttr && input.value.trim().length > parseInt(maxLenAttr)) {
                        fieldValid = false;
                        errMsg = `Cannot exceed ${maxLenAttr} characters.`;
                    }

                    // File Size Validation
                    if (fieldValid && input.type === 'file' && input.files.length && maxMbAttr) {
                        const maxBytes = parseFloat(maxMbAttr) * 1024 * 1024;
                        if (input.files[0].size > maxBytes) {
                            fieldValid = false;
                            errMsg = `File must be smaller than ${maxMbAttr}MB.`;
                        }
                    }

                    // Legacy system fallbacks
                    if (fieldValid) {
                        if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
                            fieldValid = false;
                            errMsg = 'Invalid email address.';
                        } else if (input.type === 'tel' && !/^\d{10}$/.test(input.value.trim())) {
                            fieldValid = false;
                            errMsg = 'Phone must be 10 digits.';
                        }
                    }
                }

                if (!fieldValid) {
                    isValid = false;
                    if (errSpan) errSpan.innerText = errMsg;
                }
            });

            return isValid;
        }
    };
})();
