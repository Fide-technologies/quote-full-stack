import { injectable } from "inversify";
import { shopify } from "@/config/shopify.config";
import type { ISettingsService, ISettings } from "@/interfaces";
import type { Session } from "@shopify/shopify-api";
import { logger } from "@/utils/logger";
import type {
  GetSettingsResponse,
  MetafieldDefinitionCreateResponse,
  MetafieldsSetResponse,
  ShopIdResponse
} from "@/types";
import {
  GET_SETTINGS_QUERY,
  UPDATE_GLOBAL_SETTINGS_MUTATION,
  CREATE_METAFIELD_DEFINITION_MUTATION,
  GET_SHOP_ID_QUERY
} from "@/graphql/settings";
import { SETTINGS_DEFAULTS, ERROR_MESSAGES } from "@/constants";


@injectable()
export class SettingsService implements ISettingsService {
  async ensureMetafieldDefinitions(session: Session): Promise<void> {
    const client = new shopify.api.clients.Graphql({ session });

    const definition = {
      name: "App Configuration",
      namespace: SETTINGS_DEFAULTS.NAMESPACE,
      key: SETTINGS_DEFAULTS.KEY,
      type: SETTINGS_DEFAULTS.TYPE,
      ownerType: SETTINGS_DEFAULTS.OWNER_TYPE_SHOP,
      access: {
        storefront: "PUBLIC_READ"
      }
    };

    try {
      const response = await client.request<MetafieldDefinitionCreateResponse>(CREATE_METAFIELD_DEFINITION_MUTATION, {
        variables: { definition }
      });

      const userErrors = response.data?.metafieldDefinitionCreate?.userErrors;
      if (userErrors && userErrors.length > 0) {
        if (userErrors.some((e: any) => e.code === "ALREADY_EXISTS" || e.code === "TAKEN" || e.message?.includes("already exists"))) {
          return;
        }
        logger.error("[SettingsService] Metafield definition user errors:", userErrors);
      }
    } catch (error) {
      logger.error("[SettingsService] Failed to ensure metafield definitions:", error);
    }
  }

  async getSettings(session: Session): Promise<ISettings> {
    const client = new shopify.api.clients.Graphql({ session });

    try {
      const response = await client.request<any>(GET_SETTINGS_QUERY);

      if (!response.data?.shop) {
        logger.warn("[SettingsService] No shop data returned from getSettings query");
        return SETTINGS_DEFAULTS.DEFAULTS as ISettings;
      }

      const configValue = response.data.shop.config?.value;

      if (!configValue) {
        logger.info("[SettingsService] No config metafield found, returning defaults");
        return SETTINGS_DEFAULTS.DEFAULTS as ISettings;
      }

      try {
        const parsedSettings = JSON.parse(configValue);
        logger.debug("[SettingsService] Retrieved and parsed settings successfully");
        return { ...SETTINGS_DEFAULTS.DEFAULTS, ...parsedSettings } as ISettings;
      } catch (e) {
        logger.error("[SettingsService] Failed to parse settings JSON:", e);
        return SETTINGS_DEFAULTS.DEFAULTS as ISettings;
      }
    } catch (error) {
      logger.error("[SettingsService] Failed to fetch settings:", error);
      return SETTINGS_DEFAULTS.DEFAULTS as ISettings;
    }
  }

  async updateSettings(session: Session, settings: ISettings): Promise<void> {
    logger.info(`[SettingsService] Updating settings for shop: ${session.shop}`);

    const client = new shopify.api.clients.Graphql({ session });

    try {
      // Get Shop ID first to use as ownerId
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
              type: SETTINGS_DEFAULTS.TYPE
            }
          ]
        }
      });

      const userErrors = response.data?.metafieldsSet?.userErrors;
      if (userErrors && userErrors.length > 0) {
        const firstError = userErrors[0];
        logger.error("[SettingsService] MetafieldsSet user errors:", userErrors);
        throw new Error(`${ERROR_MESSAGES.SETTINGS.UPDATE_ERROR}${firstError?.message || 'Unknown error'}`);
      }

      logger.info("[SettingsService] Successfully updated settings JSON");
    } catch (error) {
      logger.error("[SettingsService] Failed to update settings:", error);
      throw error;
    }
  }
  async checkAppEmbedStatus(session: Session): Promise<{ isEmbedded: boolean; themeId: string }> {
    try {
        const themes = await (shopify.api.rest as any).Theme.all({
            session: session,
        });

        const mainTheme = themes.data.find((theme: any) => theme.role === "main");
        if (!mainTheme) {
            logger.warn("[SettingsService] No main theme found for shop:", session.shop);
            return { isEmbedded: false, themeId: "" };
        }

        const assets = await (shopify.api.rest as any).Asset.all({
            session,
            theme_id: mainTheme.id,
        });

        const settingsAsset = assets.data.find((a: any) => a.key === "config/settings_data.json");
        if (!settingsAsset) return { isEmbedded: false, themeId: String(mainTheme.id) };

        // Fetch the full content of settings_data.json
        const fullAsset = await (shopify.api.rest as any).Asset.all({
            session,
            theme_id: mainTheme.id,
            asset: { key: "config/settings_data.json" }
        });

        const content = fullAsset.data?.[0]?.value;
        if (!content) return { isEmbedded: false, themeId: String(mainTheme.id) };

        const settingsData = JSON.parse(content);
        const blocks = settingsData.current?.blocks || {};
        
        // Accurate identification of the app embed block
        const isEmbedded = Object.values(blocks).some((block: any) => 
            block.type.includes("merchant-quote") && 
            block.type.includes("quote") && 
            block.disabled === false
        );

        return { isEmbedded, themeId: String(mainTheme.id) };
    } catch (error) {
        logger.error("[SettingsService] Failed to accurately audit theme embed status:", error);
        return { isEmbedded: false, themeId: "" };
    }
  }
}
