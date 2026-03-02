
export function generateWhatsAppUrl(phone: string | undefined, firstName: string | undefined, productTitle: string | undefined): string {
    if (!phone) return '#';
    const cleanPhone = phone.replace(/\D/g, '');
    const message = `Hi ${firstName || 'Customer'}, regarding your quote request for ${productTitle || 'product'}...`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
