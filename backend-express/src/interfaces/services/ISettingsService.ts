import type { Session } from "@shopify/shopify-api";

export interface ISettings {
    showOnAll: boolean;
    plan?: string;
}

export interface ISettingsService {
    getSettings(session: Session): Promise<ISettings>;
    updateSettings(session: Session, settings: ISettings): Promise<void>;
    ensureMetafieldDefinitions(session: Session): Promise<void>;
}
