(function () {
    window.RqValidation = {
        clearError: function (id, blockId) {
            const el = document.getElementById('rq-error-' + id + '-' + blockId);
            if (el) el.innerText = '';
        },

        validateStep1: function (blockId) {
            ['fname', 'lname', 'email', 'phone'].forEach(id => this.clearError(id, blockId));
            let isValid = true;

            const fnameInput = document.getElementById('rq-fname-' + blockId);
            if (!/^[a-zA-Z]+$/.test(fnameInput.value.trim())) {
                const err = document.getElementById('rq-error-fname-' + blockId);
                if (err) err.innerText = 'First name must contain only letters.';
                isValid = false;
            }

            const lnameInput = document.getElementById('rq-lname-' + blockId);
            if (!/^[a-zA-Z]+$/.test(lnameInput.value.trim())) {
                const err = document.getElementById('rq-error-lname-' + blockId);
                if (err) err.innerText = 'Last name must contain only letters.';
                isValid = false;
            }

            const emailInput = document.getElementById('rq-email-' + blockId);
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
                const err = document.getElementById('rq-error-email-' + blockId);
                if (err) err.innerText = 'Invalid email address.';
                isValid = false;
            }

            const phoneInput = document.getElementById('rq-phone-' + blockId);
            if (!/^\d{10}$/.test(phoneInput.value.trim())) {
                const err = document.getElementById('rq-error-phone-' + blockId);
                if (err) err.innerText = 'Phone must be 10 digits.';
                isValid = false;
            }

            return isValid;
        },

        validateStep2: function (blockId) {
            ['address1', 'city', 'district', 'state', 'pincode'].forEach(id => this.clearError(id, blockId));
            let isValid = true;

            const required = ['address1', 'city', 'district', 'state', 'pincode'];
            required.forEach(field => {
                const input = document.getElementById(`rq-${field}-${blockId}`);
                if (!input || !input.value.trim()) {
                    const err = document.getElementById(`rq-error-${field}-${blockId}`);
                    if (err) err.innerText = 'This field is required.';
                    isValid = false;
                }
            });

            const pincodeInput = document.getElementById('rq-pincode-' + blockId);
            if (pincodeInput && pincodeInput.value.trim() && !/^\d{6}$/.test(pincodeInput.value.trim())) {
                const err = document.getElementById('rq-error-pincode-' + blockId);
                if (err) err.innerText = 'Pincode must be exactly 6 digits.';
                isValid = false;
            }

            return isValid;
        },

        validateStep3: function (blockId) {
            const msgInput = document.getElementById('rq-message-' + blockId);
            const err = document.getElementById('rq-error-message-' + blockId);
            if (err) err.innerText = '';

            if (msgInput.value.trim().length > 500) {
                if (err) err.innerText = 'Message exceeds character limit.';
                return false;
            }
            return true;
        }
    };
})();
