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
            formData.forEach((value, key) => {
                dataObj[key] = value;
            });

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
                        'Accept': 'application/json'
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


