import { inject, injectable } from "inversify";
import type { IEmailConfigService, IEmailConfigData, IEmailService, IEmailConfigRepository, ISMTPProviderPreset } from "@/interfaces";
import type { Session } from "@shopify/shopify-api";
import { container } from "@/inversify.config";
import { TYPES } from "@/types";

@injectable()
export class EmailConfigService implements IEmailConfigService {
    constructor(
        @inject(TYPES.IEmailConfigRepository) private emailConfigRepository: IEmailConfigRepository
    ) { }

    async getConfig(session: Session): Promise<IEmailConfigData> {
        const config = await this.emailConfigRepository.findByShop(session.shop);
        if (!config) {
            return {};
        }

        const data = config.toObject();
        // Mask the password for security
        if (data.smtpPass) {
            data.smtpPass = "********";
        }
        return data;
    }

    async updateConfig(session: Session, config: IEmailConfigData): Promise<void> {
        // Prevent saving the masked password
        if (config.smtpPass === "********") {
            config.smtpPass = undefined;
        }

        await this.emailConfigRepository.upsertConfig(session.shop, config);
    }

    async getSmtpProviders(): Promise<ISMTPProviderPreset[]> {
        const { SMTP_PROVIDER_PRESETS } = await import("@/constants/app.constants");
        return SMTP_PROVIDER_PRESETS;
    }

    async testConnection(session: Session, config: IEmailConfigData): Promise<boolean> {
        const { smtpUser, smtpPass, ...publicSettings } = config;
        let realPass = smtpPass;

        if (smtpPass === "********") {
            const dbConfig = await this.emailConfigRepository.findByShop(session.shop);
            realPass = dbConfig?.smtpPass || "";
        }

        // Use container.get to avoid circular dependency with EmailService
        const emailService = container.get<IEmailService>(TYPES.IEmailService);
        return emailService.testSmtpConnection(publicSettings, {
            smtpUser,
            smtpPass: realPass
        });
    }
}
