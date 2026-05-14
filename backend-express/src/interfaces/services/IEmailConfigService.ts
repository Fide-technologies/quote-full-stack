import type { Session } from "@shopify/shopify-api";
import type { IEmailConfigData } from "./IEmailConfigData";
import type { ISMTPProviderPreset } from "./ISMTPProviderPreset";

export interface IEmailConfigService {
    getConfig(session: Session): Promise<IEmailConfigData>;
    updateConfig(session: Session, config: IEmailConfigData): Promise<void>;
    testConnection(session: Session, config: IEmailConfigData): Promise<boolean>;
    getSmtpProviders(): Promise<ISMTPProviderPreset[]>;
}
