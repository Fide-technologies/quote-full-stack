import type { QuoteDocument, DraftOrderInput } from "@/types";
import { injectable } from "inversify";
import { APP_DEFAULTS, QUOTE_ATTRIBUTES } from "@/constants";

@injectable()
export class DraftOrderMapper {
    /**
     * Maps a Quote document to a Shopify DraftOrderInput object.
     * @param quote The quote document to map.
     * @param currencyCode The shop's currency code.
     * @returns DraftOrderInput ready for Shopify API.
     */
    public toDraftOrderInput(quote: QuoteDocument, currencyCode: string = APP_DEFAULTS.CURRENCY_CODE): DraftOrderInput {
        const variantId = this.formatVariantId(quote.variantId);
        const amount = quote.originalPrice ? quote.originalPrice.toString() : APP_DEFAULTS.QUOTE_AMOUNT;

        const input: DraftOrderInput = {
            lineItems: [
                {
                    variantId: variantId,
                    quantity: quote.quantity,
                    priceOverride: {
                        amount: amount,
                        currencyCode: currencyCode
                    },
                    title: quote.productTitle || APP_DEFAULTS.QUOTE_ITEM_TITLE,
                },
            ],
            email: quote.email || quote.customerEmail,
            phone: this.formatPhone(quote.phone),
            note: this.buildNote(quote),
            customAttributes: [
                { key: QUOTE_ATTRIBUTES.QUOTE_ID, value: quote._id.toString() },
                { key: QUOTE_ATTRIBUTES.QUOTE_STATUS, value: quote.status },
            ],
        };

        if (this.hasAddress(quote)) {
            const address = this.mapAddress(quote);
            input.shippingAddress = address;
            input.billingAddress = address;
        }

        return input;
    }

    private formatVariantId(variantId?: string): string | undefined {
        if (!variantId) return undefined;
        return !variantId.startsWith('gid://')
            ? `gid://shopify/ProductVariant/${variantId}`
            : variantId;
    }

    private buildNote(quote: QuoteDocument): string {
        const message = quote.customerMessage || quote.message || `Quote request from ${quote.firstName} ${quote.lastName}`;
        return this.sanitize(message);
    }

    private hasAddress(quote: QuoteDocument): boolean {
        return !!(quote.address1 || quote.city || quote.firstName || quote.pincode || quote.country);
    }

    private mapAddress(quote: QuoteDocument) {
        return {
            firstName: quote.firstName || "",
            lastName: quote.lastName || "",
            address1: quote.address1 || "",
            address2: quote.address2 || "",
            city: quote.city || "",
            provinceCode: quote.state || "",
            countryCode: quote.country || "IN",
            zip: quote.pincode || "",
            phone: this.formatPhone(quote.phone),
        };
    }

    private formatPhone(phone: string | undefined): string | undefined {
        if (!phone) return undefined;
        let cleaned = phone.trim().replace(/\s+/g, '');

        // Shopify requires E.164 (e.g., +919988776655)
        // If it's a 10 digit number without +, prepend +91 (Default for India)
        if (cleaned.length === 10 && !cleaned.startsWith('+')) {
            return `+91${cleaned}`;
        }

        // If it starts with a country code but missing +, prepend +
        if (cleaned.length > 5 && !cleaned.startsWith('+')) {
            return `+${cleaned}`;
        }

        if (cleaned.length < 5 || ['n/a', 'none'].includes(cleaned.toLowerCase())) {
            return undefined;
        }
        return cleaned;
    }

    private sanitize(input: string): string {
        if (!input) return "";
        // Basic sanitization: strip HTML tags and potential script content
        return input
            .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "")
            .replace(/<[^>]+>/g, "")
            .trim();
    }
}
