export interface GraphQLResponse<T> {
    data?: T;
    errors?: Array<{
        message: string;
        locations?: Array<{ line: number; column: number }>;
        path?: string[];
        extensions?: Record<string, unknown>;
    }>;
}

export interface MetafieldDefinitionCreateResponse {
    metafieldDefinitionCreate: {
        createdDefinition: { id: string; name: string } | null;
        userErrors: Array<{ field: string[]; message: string; code: string }>;
    };
}

export interface GetSettingsResponse {
    shop: {
        id: string;
        showOnAll: {
            id: string;
            value: string;
        } | null;
    };
}

export interface ShopIdResponse {
    shop: {
        id: string;
    };
}

export interface MetafieldsSetResponse {
    metafieldsSet: {
        metafields: Array<{ key: string; value: string }>;
        userErrors: Array<{ field: string[]; message: string }>;
    };
}
