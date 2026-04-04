import { injectable, inject } from "inversify";
import nodemailer from "nodemailer";
import { TYPES } from "@/types";
import type { IEmailService, IPlanService, IMerchantService } from "@/interfaces";
import type { QuoteDocument, MerchantDocument } from "@/types";
import { PlanType, APP_DEFAULTS, EMAIL_SUBJECTS } from "@/constants";
import { logger } from "@/utils/logger";
import { env } from "@/validations/env.validation";

@injectable()
export class EmailService implements IEmailService {
    private transporter?: nodemailer.Transporter;

    constructor(
        @inject(TYPES.IMerchantService) private merchantService: IMerchantService,
        @inject(TYPES.IPlanService) private planService: IPlanService
    ) {
        logger.debug(`[EmailService] Initializing. SMTP_USER: ${env.SMTP_USER ? 'Set' : 'Missing'}, SMTP_PASS: ${env.SMTP_PASS ? 'Set' : 'Missing'}`);

        if (env.SMTP_USER && env.SMTP_PASS) {
            this.transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
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
        // Guard against missing transporter
        if (!this.transporter) {
            logger.warn("[EmailService] Quote created but email notifications are skipped because SMTP_USER or SMTP_PASS is not set.");
            return;
        }

        try {
            const merchant: MerchantDocument | null = await this.merchantService.getMerchantByShop(shop);
            if (!merchant) {
                logger.error(`[EmailService] Merchant not found for shop: ${shop}`);
                return;
            }

            const plan = await this.planService.getMerchantPlan(shop);
            const isPro = plan?.name === PlanType.PRO;

            // MERCHANT NOTIFICATION (Always sent, no plan limits)
            await this.sendToMerchant(merchant.email as string, quote);

            // CUSTOMER CONFIRMATION (Always sent, no plan limits)
            await this.sendToCustomer(quote.customerEmail, quote, isPro);

        } catch (error) {
            logger.error(`[EmailService] Failed to send quote notification:`, error);
        }
    }

    private async sendToMerchant(merchantEmail: string, quote: QuoteDocument) {
        if (!this.transporter) return;

        const mailOptions = {
            from: `"${APP_DEFAULTS.EMAIL_SENDER_NAME}" <${env.SMTP_FROM || APP_DEFAULTS.EMAIL_FROM}>`,
            to: merchantEmail,
            subject: EMAIL_SUBJECTS.NEW_QUOTE(quote.customerName || ''),
            html: this.getMerchantTemplate(quote),
        };

        await this.transporter.sendMail(mailOptions);
        logger.info(`[EmailService] Notification sent to merchant: ${merchantEmail}`);
    }

    private async sendToCustomer(customerEmail: string, quote: QuoteDocument, isPro: boolean) {
        if (!this.transporter) return;

        const mailOptions = {
            from: `"${APP_DEFAULTS.EMAIL_SENDER_NAME}" <${env.SMTP_FROM || APP_DEFAULTS.EMAIL_FROM}>`,
            to: customerEmail,
            subject: EMAIL_SUBJECTS.CUSTOMER_CONFIRMATION,
            html: this.getCustomerTemplate(quote, isPro),
        };

        await this.transporter.sendMail(mailOptions);
        logger.info(`[EmailService] Confirmation sent to customer: ${customerEmail}`);
    }

    private getMerchantTemplate(quote: QuoteDocument): string {
        const itemsList = (quote.items || []).map(item =>
            `<li>${item.title} - Qty: ${item.quantity} (Price: ${item.price})</li>`
        ).join('');

        const imagesHtml = (quote.customImages && quote.customImages.length > 0)
            ? `<h3>Attached Images:</h3>
               <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                 ${quote.customImages.map(url => `<a href="${url}" target="_blank"><img src="${url}" style="width: 150px; height: 150px; object-fit: cover; border: 1px solid #ddd; border-radius: 5px;" /></a>`).join('')}
               </div>`
            : '';

        return `
            <h2>New Quote Request Received</h2>
            <p><strong>Customer Name:</strong> ${quote.customerName || (quote.firstName + ' ' + quote.lastName)}</p>
            <p><strong>Customer Email:</strong> ${quote.customerEmail}</p>
            <p><strong>Message:</strong> ${quote.customerMessage || 'N/A'}</p>
            <h3>Items:</h3>
            <ul>${itemsList}</ul>
            <p><strong>Total Price:</strong> ${quote.totalPrice}</p>
            ${imagesHtml}
            <p>Manage this quote in your dashboard.</p>
        `;
    }

    private getCustomerTemplate(quote: QuoteDocument, isPro: boolean): string {
        const branding = !isPro ? `
            <div style="margin-top: 20px; padding: 10px; background: #f4f4f4; text-align: center; border-radius: 5px;">
                <p>Powered by <strong>${APP_DEFAULTS.EMAIL_SENDER_NAME}</strong></p>
                <small>Upgrade to Pro to remove this branding</small>
            </div>
        ` : '';

        const itemsList = (quote.items || []).map(item =>
            `<li>${item.title} - Qty: ${item.quantity}</li>`
        ).join('');

        return `
            <h2>Hello ${quote.customerName || quote.firstName},</h2>
            <p>Thank you for your interest! We have received your quote request and will get back to you soon.</p>
            <h3>Request Summary:</h3>
            <ul>${itemsList}</ul>
            <p>Our team is reviewing your request.</p>
            ${branding}
            <p>Kind regards,</p>
            <p>The Team</p>
        `;
    }
}
