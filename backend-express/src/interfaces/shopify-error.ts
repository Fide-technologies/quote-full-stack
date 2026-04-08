export interface ShopifyError {
    message?: string;
    stack?: string;
    networkStatusCode?: number;
    response?: {
        status?: number;
        errors?: unknown;
    };
}
