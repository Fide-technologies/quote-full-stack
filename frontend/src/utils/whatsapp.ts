export function generateWhatsAppUrl(phone: string | undefined, firstName?: string, productTitle?: string, customMessage?: string): string {
    if (!phone) return '#';
    const cleanPhone = phone.replace(/\D/g, '');
    const message = customMessage || `Hi ${firstName || 'Customer'}, regarding your quote request for ${productTitle || 'product'}...`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
