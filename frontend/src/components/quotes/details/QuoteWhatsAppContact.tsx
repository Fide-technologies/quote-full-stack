import { Icon } from '@shopify/polaris';
import { ChatIcon } from '@shopify/polaris-icons';
import { generateWhatsAppUrl } from '@/utils/whatsapp';

interface QuoteWhatsAppContactProps {
    phone: string | null | undefined;
    firstName: string | null | undefined;
    productTitle: string | null | undefined;
    quantity: number | string | null | undefined;
    shop: string;
}

export function QuoteWhatsAppContact({ phone, firstName, productTitle, quantity, shop }: QuoteWhatsAppContactProps) {
    const handleContact = () => {
        const storeName = shop.replace('.myshopify.com', '').replace(/-/g, ' ').toUpperCase();

        const richMessage = `*Hello ${firstName || 'there'}!*\n\n` +
            `We've received your quote request for *${productTitle || 'Universal Bundle'}* (Qty: ${quantity || 1}) on our store: *${storeName}*!\n\n` +
            `I'm reaching out to assist you with your request and see how we can help. Do you have any questions about the product or pricing?`;

        window.open(generateWhatsAppUrl(phone || '', firstName || '', productTitle || '', richMessage), '_blank');
    };

    if (!phone) return null;

    return (
        <button
            type="button"
            onClick={handleContact}
            style={{
                width: '100%',
                backgroundColor: '#25D366',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#1ebd59';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#25D366';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center' }}>
                    <Icon source={ChatIcon} tone="inherit" />
                </div>
                <span style={{ fontSize: '16px', fontWeight: 'bold', letterSpacing: '0.3px' }}>
                    Contact via WhatsApp
                </span>
            </div>
        </button>
    );
}
