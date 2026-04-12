/**
 * Formats a numeric amount into a localized currency string.
 * Uses standard separators (commas and dots) based on the currency code.
 * 
 * @param amount - The numeric amount to format
 * @param currencyCode - ISO 4217 currency code (e.g., 'USD', 'EUR', 'INR')
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currencyCode: string = 'USD'): string => {
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    } catch (error) {
        console.error('Currency formatting failed:', error);
        // Fallback to basic display if formatting fails
        return `${currencyCode} ${amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    }
};
