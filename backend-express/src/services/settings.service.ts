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
      name: "Show on all products",
      namespace: SETTINGS_DEFAULTS.NAMESPACE,
      key: SETTINGS_DEFAULTS.KEY_SHOW_ON_ALL,
      type: SETTINGS_DEFAULTS.TYPE_BOOLEAN,
      ownerType: SETTINGS_DEFAULTS.OWNER_TYPE_SHOP
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
      const response = await client.request<GetSettingsResponse>(GET_SETTINGS_QUERY);

      if (!response.data?.shop) {
        logger.warn("[SettingsService] No shop data returned from getSettings query");
        return { showOnAll: true };
      }

      const showOnAllValue = response.data.shop.showOnAll?.value;

      logger.info(`[SettingsService] RAW Metafield Value from Shopify: '${showOnAllValue}' (Type: ${typeof showOnAllValue})`);

      // Explicitly check for "false" string, otherwise default to true if null/undefined
      const showOnAll = showOnAllValue === "false" ? false : true;

      logger.debug(`[SettingsService] Retrieved settings: showOnAll=${showOnAll} (derived from raw value)`);

      return { showOnAll };
    } catch (error) {
      logger.error("[SettingsService] Failed to fetch settings:", error);
      return { showOnAll: true }; // Default fallback
    }
  }

  async updateSettings(session: Session, settings: ISettings): Promise<void> {

    if (typeof settings.showOnAll !== "boolean") {
      throw new Error(ERROR_MESSAGES.SETTINGS.INVALID_TYPE);
    }

    logger.info(`[SettingsService] Executing UPDATE (No Inversion). Incoming value: ${settings.showOnAll}`);

    const client = new shopify.api.clients.Graphql({ session });

    try {
      // Get Shop ID first to use as ownerId
      const shopResponse = await client.request<ShopIdResponse>(GET_SHOP_ID_QUERY);
      const ownerId = shopResponse.data?.shop?.id;

      if (!ownerId) {
        throw new Error(ERROR_MESSAGES.SETTINGS.NO_SHOP_ID);
      }

      const valueToSend = String(settings.showOnAll);
      logger.info(`[SettingsService] Sending to Shopify -> Owner: ${ownerId}, Key: ${SETTINGS_DEFAULTS.KEY_SHOW_ON_ALL}, Value: '${valueToSend}'`);

      const response = await client.request<MetafieldsSetResponse>(UPDATE_GLOBAL_SETTINGS_MUTATION, {
        variables: {
          metafields: [
            {
              ownerId,
              namespace: SETTINGS_DEFAULTS.NAMESPACE,
              key: SETTINGS_DEFAULTS.KEY_SHOW_ON_ALL,
              value: valueToSend,
              type: SETTINGS_DEFAULTS.TYPE_BOOLEAN
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

      logger.info(`[SettingsService] Successfully updated settings: showOnAll=${settings.showOnAll}`);
    } catch (error) {
      logger.error("[SettingsService] Failed to update settings:", error);
      throw error;
    }
  }
}
