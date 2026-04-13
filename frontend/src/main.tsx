import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
import enTranslations from '@shopify/polaris/locales/en.json';
import './index.css';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const rootElement = document.getElementById('root') as HTMLElement;

// Read the Shopify host param from URL and persist it.
// This is the base64-encoded host identifier that Shopify passes when loading the embedded app.
// We must preserve it across navigations so the billing flow can use it.
const urlParams = new URLSearchParams(window.location.search);
const hostParam = urlParams.get('host') || '';
if (hostParam) {
    // Store under a consistent key for use during billing upgrade
    sessionStorage.setItem('shopify_host', hostParam);
}

import { NotificationProvider } from './providers/NotificationProvider';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            retry: 1,
        },
    },
});

ReactDOM.createRoot(rootElement).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <AppProvider i18n={enTranslations}>
                <NotificationProvider>
                    <BrowserRouter>
                        <App />
                    </BrowserRouter>
                </NotificationProvider>
            </AppProvider>
        </QueryClientProvider>
    </StrictMode>,
);