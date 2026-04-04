(function () {
    // For development, we can still use BACKEND_URL if needed, 
    // but the production-ready way is using App Proxy.
    // The prefix and subpath are defined in shopify.app.toml
    const PROXY_PATH = window.Shopify && window.Shopify.shop ? '/apps/request-quote' : 'https://tarpon-social-simply.ngrok-free.app/api';

    window.RqApi = {
        submitQuote: async function (blockId, cartItems = null) {
            const form = document.getElementById('rq-form-' + blockId);
            if (!form) return { success: false, error: 'Form not found.' };

            // ... (rest of data collection remains same)
            const formData = new FormData(form);
            const dataObj = {};
            const customData = {};

            const systemFields = [
                'shop', 'productId', 'productTitle', 'variantId', 'variantTitle',
                'productImage', 'productUrl', 'price', 'quantity',
                'firstName', 'lastName', 'fname', 'lname', 'email', 'phone',
                'address1', 'address2', 'city', 'district', 'state', 'pincode', 'message'
            ];

            formData.forEach((value, key) => {
                if (systemFields.includes(key)) {
                    dataObj[key] = value;
                } else {
                    const input = form.querySelector(`[name="${key}"]`);
                    const label = input?.closest('.rq-input-group')?.querySelector('label')?.innerText.replace('*', '').trim() || key;
                    customData[label] = value;
                }
            });

            dataObj['customData'] = customData;

            const fileInputs = form.querySelectorAll('input[type="file"]');
            const filesToUpload = [];

            fileInputs.forEach(input => {
                const files = input._rq_files || input.files;
                if (files && files.length) {
                    Array.from(files).forEach(f => filesToUpload.push(f));
                }
            });

            if (filesToUpload.length > 0) {
                try {
                    const uploadFormData = new FormData();
                    filesToUpload.forEach(file => {
                        uploadFormData.append('images', file);
                    });

                    const uploadRes = await fetch(`${PROXY_PATH}/upload`, {
                        method: 'POST',
                        body: uploadFormData
                    });

                    if (uploadRes.ok) {
                        const uploadData = await uploadRes.json();
                        const urls = uploadData.data?.urls || uploadData.urls;
                        if (urls) {
                            dataObj['customImages'] = urls;
                        }
                    }
                } catch (err) {
                    console.error('Image upload failed, submitting quote without images:', err);
                }
            }

            if (cartItems && cartItems.length > 0) {
                dataObj['items'] = cartItems.map(item => ({
                    variantId: item.variantId,
                    productId: item.productId,
                    title: item.title,
                    variantTitle: item.variantTitle,
                    quantity: parseInt(item.quantity),
                    price: parseFloat(item.price)
                }));

                dataObj['productId'] = cartItems[0].productId;
                dataObj['productTitle'] = cartItems[0].title;
                dataObj['variantId'] = cartItems[0].variantId;
                dataObj['price'] = cartItems[0].price;
                dataObj['quantity'] = cartItems.reduce((acc, i) => acc + i.quantity, 0);
            }

            const shop = document.getElementById(`rq-app-root-${blockId}`)?.getAttribute('data-shop')
                || (window.Shopify && window.Shopify.shop)
                || new URL(window.location.href).searchParams.get('shop');

            if (shop) {
                dataObj['shop'] = shop;
            }

            const fetchWithRetry = async (url, options, retries = 2, delay = 1000) => {
                try {
                    const response = await fetch(url, options);
                    // If server is overwhelmed (429/5xx), retry
                    if ((response.status === 429 || response.status >= 500) && retries > 0) {
                        console.log(`Server busy (${response.status}), retrying in ${delay}ms...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        return fetchWithRetry(url, options, retries - 1, delay * 2);
                    }
                    return response;
                } catch (err) {
                    if (retries > 0) {
                        console.log(`Network error, retrying in ${delay}ms...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        return fetchWithRetry(url, options, retries - 1, delay * 2);
                    }
                    throw err;
                }
            };

            try {
                const response = await fetchWithRetry(`${PROXY_PATH}/quotes`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(dataObj)
                });

                const text = await response.text();
                let data;
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    return { success: false, error: 'Server returned an invalid response.' };
                }

                if (response.ok) {
                    return { success: true, data: dataObj, id: data.id || data.data?.id };
                } else {
                    return { success: false, error: data.error || data.message || 'Failed to send quote.' };
                }
            } catch (err) {
                console.error('Quote Submission Error:', err);
                return { success: false, error: 'An error occurred. Please try again.' };
            }
        },

        fetchFormConfig: async function (shop) {
            try {
                // We use the proxy path + forms/proxy endpoint.
                const response = await fetch(`${PROXY_PATH}/forms/proxy?shop=${encodeURIComponent(shop)}`, {
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch form configuration');
                }
                const data = await response.json();
                return data.data; // The config is returned inside { data: ... } by backend BaseController.ok
            } catch (err) {
                console.error('Failed fetching form config:', err);
                return null;
            }
        },

        fetchProduct: async function (handle) {
            try {
                const res = await fetch(`/products/${handle}.js`);
                if (!res.ok) throw new Error('Product not found');
                return await res.json();
            } catch (err) {
                console.error(err);
                return null;
            }
        }
    };
})();


