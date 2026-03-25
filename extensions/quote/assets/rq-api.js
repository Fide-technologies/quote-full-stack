(function () {
    // For development, we can still use BACKEND_URL if needed, 
    // but the production-ready way is using App Proxy.
    // The prefix and subpath are defined in shopify.app.toml
    const PROXY_PATH = window.Shopify && window.Shopify.shop ? '/apps/request-quote' : 'https://tarpon-social-simply.ngrok-free.app/api';

    window.RqApi = {
        submitQuote: async function (blockId, cartItems = null) {
            const form = document.getElementById('rq-form-' + blockId);
            if (!form) return { success: false, error: 'Form not found.' };

            const formData = new FormData(form);
            const dataObj = {};
            const customData = {};
            
            // System fields that shouldn't go into customData
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
                    // Find the readable label for this custom field to make Quote Management better
                    const input = form.querySelector(`[name="${key}"]`);
                    const label = input?.closest('.rq-input-group')?.querySelector('label')?.innerText.replace('*', '').trim() || key;
                    customData[label] = value;
                }
            });
            
            dataObj['customData'] = customData;

            // Handle file uploads separately via App Proxy
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

            // If cartItems are provided, we use them (Bulk Quote)
            if (cartItems && cartItems.length > 0) {
                dataObj['items'] = cartItems.map(item => ({
                    variantId: item.variantId,
                    productId: item.productId,
                    title: item.title,
                    variantTitle: item.variantTitle,
                    quantity: parseInt(item.quantity),
                    price: parseFloat(item.price)
                }));

                // For bulk, we pick the first item as the "main" one for backwards compatibility
                dataObj['productId'] = cartItems[0].productId;
                dataObj['productTitle'] = cartItems[0].title;
                dataObj['variantId'] = cartItems[0].variantId;
                dataObj['price'] = cartItems[0].price;
                dataObj['quantity'] = cartItems.reduce((acc, i) => acc + i.quantity, 0);
            }

            // Get shop from data attribute, window.Shopify, or URL params
            const shop = document.getElementById(`rq-app-root-${blockId}`)?.getAttribute('data-shop')
                || (window.Shopify && window.Shopify.shop)
                || new URL(window.location.href).searchParams.get('shop');

            if (shop) {
                dataObj['shop'] = shop;
            }

            try {
                // Requesting via App Proxy
                const response = await fetch(`${PROXY_PATH}/quotes`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'ngrok-skip-browser-warning': 'true'
                    },
                    body: JSON.stringify(dataObj)
                });

                const text = await response.text();
                let data;
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    console.log("error is: ", e)
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
                        'Accept': 'application/json',
                        'ngrok-skip-browser-warning': 'true'
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


