import { shopify } from "@/config/shopify.config";
import { ERROR_MESSAGES, SETTINGS_DEFAULTS } from "@/constants";
import {
    CREATE_METAFIELD_DEFINITION_MUTATION,
    GET_SETTINGS_QUERY,
    GET_SHOP_ID_QUERY,
    UPDATE_GLOBAL_SETTINGS_MUTATION,
} from "@/graphql/settings";
import type { ISettings, ISettingsService } from "@/interfaces";
import type {
    GetSettingsResponse,
    MetafieldDefinitionCreateResponse,
    MetafieldsSetResponse,
    ShopIdResponse,
} from "@/types";
import { logger } from "@/utils/logger";
import type { Session } from "@shopify/shopify-api";
import { TYPES } from "@/types";
import { inject, injectable } from "inversify";
import type { IMerchantService } from "@/interfaces";
import type { IPrivateSettings } from "@/interfaces/services/ISettingsService";

@injectable()
export class SettingsService implements ISettingsService {
    constructor(
        @inject(TYPES.IMerchantService) private merchantService: IMerchantService,
    ) { }
    async ensureMetafieldDefinitions(session: Session): Promise<void> {
        const client = new shopify.api.clients.Graphql({ session });

        const definitions = [
            {
                name: "App Configuration",
                namespace: SETTINGS_DEFAULTS.NAMESPACE,
                key: SETTINGS_DEFAULTS.KEY,
                type: SETTINGS_DEFAULTS.TYPE,
                ownerType: SETTINGS_DEFAULTS.OWNER_TYPE_SHOP,
                access: {
                    storefront: "PUBLIC_READ",
                },
            },
            {
                name: "App Private Configuration",
                namespace: SETTINGS_DEFAULTS.NAMESPACE,
                key: SETTINGS_DEFAULTS.PRIVATE_KEY,
                type: SETTINGS_DEFAULTS.TYPE,
                ownerType: SETTINGS_DEFAULTS.OWNER_TYPE_SHOP,
                access: {
                    storefront: "NONE", // Keep private
                },
            },
        ];

        for (const definition of definitions) {
            try {
                const response = await client.request<MetafieldDefinitionCreateResponse>(
                    CREATE_METAFIELD_DEFINITION_MUTATION,
                    {
                        variables: { definition },
                    },
                );

                const userErrors = response.data?.metafieldDefinitionCreate?.userErrors;
                if (userErrors && userErrors.length > 0) {
                    if (
                        userErrors.some(
                            (e: { code: string; message?: string }) =>
                                e.code === "ALREADY_EXISTS" || e.code === "TAKEN" || e.message?.includes("already exists"),
                        )
                    ) {
                        continue;
                    }
                    logger.error("[SettingsService] Metafield definition user errors:", userErrors);
                }
            } catch (error) {
                logger.error(`[SettingsService] Failed to ensure metafield definition for ${definition.key}:`, error);
            }
        }
    }

    async getSettings(session: Session): Promise<ISettings> {
        try {
            // Try database first
            const merchant = await this.merchantService.getMerchantByShop(session.shop);
            if (merchant?.settings) {
                return { ...SETTINGS_DEFAULTS.DEFAULTS, ...merchant.settings } as ISettings;
            }

            // Fallback to Shopify Metafields
            const client = new shopify.api.clients.Graphql({ session });
            const response = await client.request<GetSettingsResponse>(GET_SETTINGS_QUERY);

            const configValue = response.data?.shop?.config?.value;
            if (configValue) {
                const parsedSettings = JSON.parse(configValue);

                // If found in Shopify but not DB, migrate to DB
                await this.merchantService.createOrUpdateMerchant({
                    shop: session.shop,
                    settings: parsedSettings,
                });

                return { ...SETTINGS_DEFAULTS.DEFAULTS, ...parsedSettings } as ISettings;
            }

            return SETTINGS_DEFAULTS.DEFAULTS as unknown as ISettings;
        } catch (error) {
            logger.error("[SettingsService] Failed to fetch settings:", error);
            return SETTINGS_DEFAULTS.DEFAULTS as unknown as ISettings;
        }
    }

    async getPrivateSettings(session: Session): Promise<IPrivateSettings> {
        try {
            // Try database first
            const merchant = await this.merchantService.getMerchantByShop(session.shop);
            if (merchant?.privateSettings) {
                return merchant.privateSettings;
            }

            // Fallback to Shopify Metafields (legacy/transition)
            const client = new shopify.api.clients.Graphql({ session });
            const GET_PRIVATE_SETTINGS_QUERY = `
                query GetPrivateSettings {
                    shop {
                        metafield(namespace: "${SETTINGS_DEFAULTS.NAMESPACE}", key: "${SETTINGS_DEFAULTS.PRIVATE_KEY}") {
                            value
                        }
                    }
                }
            `;

            const response = await client.request<{ shop?: { metafield?: { value: string } } }>(GET_PRIVATE_SETTINGS_QUERY);
            const value = response.data?.shop?.metafield?.value;

            if (value) {
                const parsedPrivate = JSON.parse(value);

                // Migrate to DB
                await this.merchantService.createOrUpdateMerchant({
                    shop: session.shop,
                    privateSettings: parsedPrivate,
                });

                return parsedPrivate;
            }

            return {};
        } catch (error) {
            logger.error("[SettingsService] Failed to fetch private settings:", error);
            return {};
        }
    }

    async updateSettings(session: Session, settings: ISettings): Promise<void> {
        logger.info(`[SettingsService] Updating settings for shop: ${session.shop}`);

        try {
            // 1. Update database
            await this.merchantService.createOrUpdateMerchant({
                shop: session.shop,
                settings,
            });

            // 2. Sync to Shopify Metafields (for storefront access)
            const client = new shopify.api.clients.Graphql({ session });
            const shopResponse = await client.request<ShopIdResponse>(GET_SHOP_ID_QUERY);
            const ownerId = shopResponse.data?.shop?.id;

            if (!ownerId) {
                throw new Error(ERROR_MESSAGES.SETTINGS.NO_SHOP_ID);
            }

            const valueToSend = JSON.stringify(settings);

            const response = await client.request<MetafieldsSetResponse>(UPDATE_GLOBAL_SETTINGS_MUTATION, {
                variables: {
                    metafields: [
                        {
                            ownerId,
                            namespace: SETTINGS_DEFAULTS.NAMESPACE,
                            key: SETTINGS_DEFAULTS.KEY,
                            value: valueToSend,
                            type: SETTINGS_DEFAULTS.TYPE,
                        },
                    ],
                },
            });

            const userErrors = response.data?.metafieldsSet?.userErrors;
            if (userErrors && userErrors.length > 0) {
                logger.error("[SettingsService] MetafieldsSet user errors:", userErrors);
                // We don't throw here because DB update was successful, but we log it
            }

            logger.info("[SettingsService] Successfully updated settings in DB and synced to Shopify");
        } catch (error) {
            logger.error("[SettingsService] Failed to update settings:", error);
            throw error;
        }
    }

    async updatePrivateSettings(session: Session, settings: IPrivateSettings): Promise<void> {
        logger.info(`[SettingsService] Updating private settings for shop: ${session.shop}`);

        try {
            // Update database ONLY (keep SMTP credentials out of Shopify)
            await this.merchantService.createOrUpdateMerchant({
                shop: session.shop,
                privateSettings: settings,
            });

            logger.info("[SettingsService] Successfully updated private settings in DB");
        } catch (error) {
            logger.error("[SettingsService] Failed to update private settings:", error);
            throw error;
        }
    }

    async checkAppEmbedStatus(session: Session): Promise<{ isEmbedded: boolean; themeId: string }> {
        try {
            const themes = await (shopify.api.rest as unknown as { Theme: { all: (params: { session: Session }) => Promise<{ data: Array<{ role: string; id: number | string }> }> } }).Theme.all({
                session: session,
            });

            const mainTheme = themes.data.find((theme: { role: string; id: string | number }) => theme.role === "main");
            if (!mainTheme) {
                logger.warn("[SettingsService] No main theme found for shop:", session.shop);
                return { isEmbedded: false, themeId: "" };
            }

            return {
                isEmbedded: false, // Default to false, frontend will override via App Bridge
                themeId: String(mainTheme.id)
            };
        } catch (error) {
            logger.error("[SettingsService] Error finding main theme:", error);
            return { isEmbedded: false, themeId: "" };
        }
    }
}
