export interface BillingItem {
    lineItems?: Array<{
        plan?: {
            pricingDetails?: {
                __typename: string;
                price: { amount: string; currencyCode: string };
                interval?: string;
                cappedAmount: { amount: string; currencyCode: string };
            };
        };
    }>;
    price?: { amount: string; currencyCode: string };
}

export function formatPricingDetails(item: BillingItem) {
    let price = '0.00';
    let currency = 'USD';
    let detail = 'One-time';

    if (item.lineItems?.[0]?.plan?.pricingDetails) {
        const pricing = item.lineItems[0].plan.pricingDetails;
        if (pricing.__typename === 'AppRecurringPricing') {
            price = pricing.price.amount;
            currency = pricing.price.currencyCode;
            const intervalText = pricing.interval?.replace(/_/g, ' ').toLowerCase() || 'every 30 days';
            detail = intervalText.charAt(0).toUpperCase() + intervalText.slice(1);
        } else if (pricing.__typename === 'AppUsagePricing') {
            price = pricing.cappedAmount.amount;
            currency = pricing.cappedAmount.currencyCode;
            detail = 'Usage-based';
        }
    } else if (item.price) {
        price = item.price.amount;
        currency = item.price.currencyCode;
        detail = 'One-time purchase';
    }

    return { price, currency, detail };
}

export function formatChargeDate(dateString: string): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).format(new Date(dateString));
}

export function getChargeStatusTone(status: string): "info" | "success" | "warning" | "critical" {
    const uppercaseStatus = status.toUpperCase();
    switch (uppercaseStatus) {
        case "ACTIVE":
        case "ACTIVATED":
            return "success";
        case "CANCELLED":
        case "DECLINED":
            return "info";
        case "EXPIRED":
            return "warning";
        case "FAILING":
        case "FROZEN":
            return "critical";
        default:
            return "info";
    }
}
