import { useState, useEffect, useCallback } from 'react';

export interface ExtensionActivation {
    target: string;
    handle: string;
    name: string;
    status: 'active' | 'available' | 'unavailable';
    activations?: unknown[];
}

export interface ExtensionInfo {
    handle: string;
    type: 'ui_extension' | 'theme_app_extension';
    activations: ExtensionActivation[];
}

export const useAppExtensions = () => {
    const [isEmbedded, setIsEmbedded] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const checkExtensions = useCallback(async (showLoading = true) => {
        if (showLoading) setIsLoading(true);
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const shopify = (window as any).shopify;

            if (!shopify || !shopify.app || !shopify.app.extensions) {
                if (showLoading) {
                    console.warn('[useAppExtensions] Shopify App Bridge extensions API not available');
                    setIsEmbedded(false);
                }
                return;
            }

            const extensions: ExtensionInfo[] = await shopify.app.extensions();
            console.debug('[useAppExtensions] Fetched extensions:', extensions);

            const themeExtension = extensions.find(ext => ext.type === 'theme_app_extension');

            if (!themeExtension) {
                setIsEmbedded(false);
            } else {
                const quoteEmbed = themeExtension.activations.find(act => act.handle === 'quote_embed');

                if (quoteEmbed) {
                    const activeStatus = quoteEmbed.status === 'active';
                    setIsEmbedded(activeStatus);
                    console.debug(`[useAppExtensions] Embed status: ${activeStatus ? 'Active' : 'Disabled'}`);
                } else {
                    setIsEmbedded(false);
                }
            }
        } catch (err) {
            console.error('[useAppExtensions] Error fetching extensions:', err);
            setError(err instanceof Error ? err : new Error('Unknown error'));
            setIsEmbedded(false);
        } finally {
            if (showLoading) setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkExtensions();

        const handleWindowFocus = () => {
            console.debug('[useAppExtensions] Window focus detected, manually refreshing extension status...');
            checkExtensions(false);
        };

        window.addEventListener('focus', handleWindowFocus);
        return () => window.removeEventListener('focus', handleWindowFocus);
    }, [checkExtensions]);

    return {
        isEmbedded,
        isLoading,
        error,
        refresh: () => checkExtensions(true)
    };
};
