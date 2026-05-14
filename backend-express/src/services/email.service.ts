import { shopify, sessionStorage } from "@/config";
import { APP_DEFAULTS, EMAIL_SUBJECTS, PlanType, SETTINGS_DEFAULTS } from "@/constants";
import type { IEmailService, IMerchantService, IPlanService, ISettings } from "@/interfaces";
import type { IEmailConfigData, IEmailConfigService } from "@/interfaces";
import { TYPES } from "@/types";
import type { MerchantDocument, QuoteDocument } from "@/types";
import { logger } from "@/utils/logger";
import { env } from "@/validations/env.validation";
import { inject, injectable } from "inversify";
import nodemailer from "nodemailer";

@injectable()
export class EmailService implements IEmailService {
    private transporter?: nodemailer.Transporter;

    constructor(
        @inject(TYPES.IMerchantService) private merchantService: IMerchantService,
        @inject(TYPES.IPlanService) private planService: IPlanService,
        @inject(TYPES.IEmailConfigService) private emailConfigService: IEmailConfigService,
    ) {
        logger.debug("[EmailService] Initializing transporter...");

        if (env.SMTP_USER && env.SMTP_PASS) {
            this.transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                    user: env.SMTP_USER,
                    pass: env.SMTP_PASS,
                },
            });
            logger.info("[EmailService] Transporter created successfully for Gmail (SSL).");
        } else {
            logger.warn("[EmailService] Transporter NOT created: missing credentials in env.");
        }
    }

    async sendQuoteNotification(shop: string, quote: QuoteDocument): Promise<void> {
        const merchant: MerchantDocument | null = await this.merchantService.getMerchantByShop(shop);
        if (!merchant) {
            logger.error(`[EmailService] Merchant not found for shop: ${shop}`);
            return;
        }

        const sessions = await sessionStorage.findSessionsByShop(shop);
        if (!sessions || sessions.length === 0 || !sessions[0]) {
            logger.warn(`[EmailService] No active sessions found for shop: ${shop}. Falling back to default SMTP.`);
            const transporter = await this.getTransporter(SETTINGS_DEFAULTS.DEFAULTS as unknown as IEmailConfigData);
            if (transporter) {
                await this.sendToMerchant(merchant.email as string, quote, transporter, SETTINGS_DEFAULTS.DEFAULTS as unknown as IEmailConfigData);
            }
            return;
        }
        const session = sessions[0];
        const emailConfig = await this.emailConfigService.getConfig(session);

        const transporter = await this.getTransporter(emailConfig);

        if (!transporter) {
            logger.warn(
                `[EmailService] Quote created but email notifications are skipped for ${shop} because no SMTP is configured.`,
            );
            return;
        }

        try {
            const plan = await this.planService.getMerchantPlan(shop);
            const isPro = plan?.name === PlanType.PRO;

            await this.sendToMerchant(merchant.email as string, quote, transporter, emailConfig);

            await this.sendToCustomer(quote.customerEmail, quote, isPro, transporter, emailConfig);
        } catch (error) {
            logger.error("[EmailService] Failed to send quote notification:", error);
        }
    }

    async testSmtpConnection(publicSettings: Partial<IEmailConfigData>, privateSettings: Partial<IEmailConfigData>): Promise<boolean> {
        const config = { ...publicSettings, ...privateSettings } as IEmailConfigData;
        const transporter = await this.getTransporter(config);
        if (!transporter) return false;

        try {
            await transporter.verify();

            // Send a test email
            const mailOptions = {
                from: config.smtpFrom || env.SMTP_FROM || APP_DEFAULTS.EMAIL_FROM,
                to: config.adminEmail || env.SMTP_FROM || APP_DEFAULTS.EMAIL_FROM,
                subject: "SMTP Test Connection - Success",
                text: "This is a test email to verify your SMTP configuration. If you received this, your settings are correct!",
            };

            await transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            logger.error("[EmailService] SMTP Verification failed:", error);
            throw error;
        }
    }

    private async getTransporter(config: IEmailConfigData): Promise<nodemailer.Transporter | undefined> {
        if (config.smtpEnabled && config.smtpHost && config.smtpUser && config.smtpPass) {
            return nodemailer.createTransport({
                host: config.smtpHost,
                port: config.smtpPort,
                secure: config.smtpSecure,
                auth: {
                    user: config.smtpUser,
                    pass: config.smtpPass,
                },
            });
        }

        // Fallback to global
        return this.transporter;
    }

    async sendQuoteAcceptance(quote: QuoteDocument, price: number, quantity: number, message: string): Promise<void> {
        const sessions = await sessionStorage.findSessionsByShop(quote.shop);
        if (!sessions || sessions.length === 0 || !sessions[0]) return;
        const session = sessions[0];
        const emailConfig = await this.emailConfigService.getConfig(session);
        const transporter = await this.getTransporter(emailConfig);

        if (!transporter) {
            logger.warn("[EmailService] Quote acceptance email skipped: Transporter missing.");
            return;
        }

        try {
            const merchant = await this.merchantService.getMerchantByShop(quote.shop);
            const storeName = this.getStoreDisplayName(merchant, quote.shop);

            const mailOptions = {
                from: emailConfig.smtpFrom || `"${APP_DEFAULTS.EMAIL_SENDER_NAME}" <${env.SMTP_FROM || APP_DEFAULTS.EMAIL_FROM}>`,
                to: quote.customerEmail,
                subject: `Accepted Quote Request - ${quote.productTitle}`,
                html: `
                    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #007ace;">Good News! Your Quote Request has been Accepted</h2>
                        <p>Hello ${quote.firstName || quote.customerName},</p>
                        <p>We are pleased to inform you that we have accepted your request for <strong>${quote.productTitle}</strong>.</p>
                        
                        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <h3 style="margin-top: 0;">Accepted Details:</h3>
                            <ul style="list-style: none; padding: 0;">
                                <li><strong>Unit Price:</strong> $${(price / 100).toFixed(2)}</li>
                                <li><strong>Quantity:</strong> ${quantity}</li>
                                <li><strong>Total Price:</strong> $${((price * quantity) / 100).toFixed(2)}</li>
                            </ul>
                        </div>

                        ${message ? `<div style="margin: 20px 0;"><strong>Merchant Note:</strong><p style="font-style: italic; color: #555;">"${message}"</p></div>` : ""}

                        <p>We will shortly reach out with the next steps or you can expect a Draft Order/Invoice in your email shortly.</p>
                        
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
                        <p style="font-size: 14px; color: #666;">Best regards,<br/><strong>The ${storeName} Team</strong></p>
                    </div>
                `,
            };

            await transporter.sendMail(mailOptions);
            logger.info(`[EmailService] Acceptance email sent to ${quote.customerEmail} for quote ${quote._id}`);
        } catch (error) {
            logger.error("[EmailService] Failed to send quote acceptance email:", error);
        }
    }

    async sendQuoteRejection(quote: QuoteDocument, message: string): Promise<void> {
        const sessions = await sessionStorage.findSessionsByShop(quote.shop);
        if (!sessions || sessions.length === 0 || !sessions[0]) return;
        const session = sessions[0];
        const emailConfig = await this.emailConfigService.getConfig(session);
        const transporter = await this.getTransporter(emailConfig);

        if (!transporter) {
            logger.warn("[EmailService] Quote rejection email skipped: Transporter missing.");
            return;
        }

        try {
            const merchant = await this.merchantService.getMerchantByShop(quote.shop);
            const storeName = this.getStoreDisplayName(merchant, quote.shop);

            const mailOptions = {
                from: emailConfig.smtpFrom || `"${APP_DEFAULTS.EMAIL_SENDER_NAME}" <${env.SMTP_FROM || APP_DEFAULTS.EMAIL_FROM}>`,
                to: quote.customerEmail,
                subject: `Update regarding your Quote Request - ${quote.productTitle}`,
                html: `
                    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #d72c0d;">Update on your Quote Request</h2>
                        <p>Hello ${quote.firstName || quote.customerName},</p>
                        <p>Thank you for your interest in <strong>${quote.productTitle}</strong>. We have reviewed your quote request.</p>
                        
                        <div style="background-color: #fff4f4; border-left: 4px solid #d72c0d; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p style="margin: 0; color: #333;">
                                ${message || "Unfortunately, we are unable to fulfill this quote request at this time."}
                            </p>
                        </div>

                        <p>We appreciate your understanding. If you have any other questions or would like to explore alternative options, please don't hesitate to reach out.</p>
                        
                        <div style="margin-top: 30px; text-align: center;">
                            <a href="https://${quote.shop}/products/${quote.productHandle || ""}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                                View Product & Try Again
                            </a>
                        </div>

                        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
                        <p style="font-size: 14px; color: #666;">Best regards,<br/><strong>The ${storeName} Team</strong></p>
                    </div>
                `,
            };

            await transporter.sendMail(mailOptions);
            logger.info(`[EmailService] Rejection email sent to ${quote.customerEmail} for quote ${quote._id}`);
        } catch (error) {
            logger.error("[EmailService] Failed to send quote rejection email:", error);
        }
    }

    private async sendToMerchant(merchantEmail: string, quote: QuoteDocument, transporter: nodemailer.Transporter, emailConfig: IEmailConfigData) {
        const mailOptions = {
            from: emailConfig.smtpFrom || `"${APP_DEFAULTS.EMAIL_SENDER_NAME}" <${env.SMTP_FROM || APP_DEFAULTS.EMAIL_FROM}>`,
            to: emailConfig.adminEmail || merchantEmail,
            subject: EMAIL_SUBJECTS.NEW_QUOTE(quote.customerName || ""),
            html: this.getMerchantTemplate(quote),
        };

        await transporter.sendMail(mailOptions);
        logger.info(`[EmailService] Notification sent to merchant: ${merchantEmail}`);
    }

    private async sendToCustomer(customerEmail: string, quote: QuoteDocument, isPro: boolean, transporter: nodemailer.Transporter, emailConfig: IEmailConfigData) {
        const merchant = await this.merchantService.getMerchantByShop(quote.shop);
        const storeName = this.getStoreDisplayName(merchant, quote.shop);

        const mailOptions = {
            from: emailConfig.smtpFrom || `"${storeName}" <${env.SMTP_FROM || APP_DEFAULTS.EMAIL_FROM}>`,
            to: customerEmail,
            subject: EMAIL_SUBJECTS.CUSTOMER_CONFIRMATION,
            html: this.getCustomerTemplate(quote, isPro, storeName),
        };

        await transporter.sendMail(mailOptions);
        logger.info(`[EmailService] Confirmation sent to customer: ${customerEmail}`);
    }

    private getMerchantTemplate(quote: QuoteDocument): string {
        const itemsList = (quote.items || [])
            .map((item) => `<li>${item.title} - Qty: ${item.quantity} (Price: ${item.price})</li>`)
            .join("");

        const imagesHtml =
            quote.customImages && quote.customImages.length > 0
                ? `<h3>Attached Images:</h3>
               <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                 ${quote.customImages.map((url) => `<a href="${url}" target="_blank"><img src="${url}" style="width: 150px; height: 150px; object-fit: cover; border: 1px solid #ddd; border-radius: 5px;" /></a>`).join("")}
               </div>`
                : "";

        return `
            <h2>New Quote Request Received</h2>
            <p><strong>Customer Name:</strong> ${quote.customerName || `${quote.firstName} ${quote.lastName}`}</p>
            <p><strong>Customer Email:</strong> ${quote.customerEmail}</p>
            <p><strong>Message:</strong> ${quote.customerMessage || "N/A"}</p>
            <h3>Items:</h3>
            <ul>${itemsList}</ul>
            <p><strong>Total Price:</strong> ${quote.totalPrice}</p>
            ${imagesHtml}
            <p>Manage this quote in your dashboard.</p>
        `;
    }

    private getCustomerTemplate(quote: QuoteDocument, isPro: boolean, storeName: string): string {
        const branding = !isPro
            ? `
            <div style="margin-top: 20px; padding: 10px; background: #f4f4f4; text-align: center; border-radius: 5px;">
                <p>Powered by <strong>Quote Management System</strong></p>
                <small>Upgrade to Pro to remove this branding</small>
            </div>
        `
            : "";

        const itemsList = (quote.items || []).map((item) => `<li>${item.title} - Qty: ${item.quantity}</li>`).join("");

        return `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                <h2 style="color: #007ace;">Hello ${quote.customerName || quote.firstName},</h2>
                <p>Thank you for your interest in <strong>${storeName}</strong>! We have received your quote request and will get back to you soon.</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Request Summary:</h3>
                    <ul>${itemsList}</ul>
                </div>

                <p>Our team is reviewing your request.</p>
                ${branding}
                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
                <p style="font-size: 14px; color: #666;">Kind regards,<br/><strong>The ${storeName} Team</strong></p>
            </div>
        `;
    }

    private getStoreDisplayName(merchant: MerchantDocument | null, shop: string): string {
        if (merchant?.name) return merchant.name;

        // Fallback: clean up the .myshopify.com URL
        if (!shop) return "Our Store";

        const shopHandle = shop.split(".")[0] || "Our Store";

        return shopHandle
            .replace(/-/g, " ")
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }
}
