import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { acceptQuote, type Quote } from '../api/quotes';
import { formatCurrency } from '../utils/currency';

interface UseQuoteAcceptProps {
    quote: Quote | null;
}

export const useQuoteAccept = ({ quote }: UseQuoteAcceptProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [price, setPrice] = useState<string>(''); // Human readable price (dollars)
    const [quantity, setQuantity] = useState<number>(1);
    const [currency, setCurrency] = useState('USD');
    const [message, setMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const queryClient = useQueryClient();

    // Reset/Initialize values when modal opens or quote changes
    useEffect(() => {
        if (quote && isModalOpen) {
            const initialPrice = (Number(quote.originalPrice) / 100).toString();
            setPrice(initialPrice);
            setQuantity(quote.quantity || 1);
        }
    }, [quote, isModalOpen]);

    // Dynamically update message when values change
    useEffect(() => {
        if (!quote) return;

        const unitDisplay = formatCurrency(Number(price), currency);
        const totalDisplay = formatCurrency(Number(price) * quantity, currency);

        const newMessage = `I've reviewed your request for ${quote.productTitle} and I'm happy to accept your proposed price.

Accepted Details:
- Unit Price: ${unitDisplay}
- Quantity: ${quantity}
- Total Amount: ${totalDisplay}

We will reach out soon with the next steps.`;
        
        setMessage(newMessage);
    }, [price, quantity, currency, quote]);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setError(null);
    };

    const mutation = useMutation({
        mutationFn: (data: { price: number; quantity: number; message: string }) => 
            acceptQuote(quote!.id, data),
        onSuccess: () => {
            setSuccess('Quote accepted and customer notified via email.');
            queryClient.invalidateQueries({ queryKey: ['quote', quote?.id] });
            closeModal();
        },
        onError: (err: Error) => {
            setError(err.message || 'Failed to accept quote. Please try again.');
        }
    });

    const handleAccept = () => {
        const numericPrice = Number(price);
        if (isNaN(numericPrice) || numericPrice <= 0 || quantity <= 0) {
            setError('Please provide a valid price and quantity.');
            return;
        }

        mutation.mutate({
            price: Math.round(numericPrice * 100), // Convert back to cents for backend
            quantity,
            message: `${message}\n\n(Base: ${currency})`
        });
    };

    return {
        isModalOpen,
        openModal,
        closeModal,
        price,
        setPrice,
        quantity,
        setQuantity,
        currency,
        setCurrency,
        message,
        setMessage,
        handleAccept,
        formatCurrency, // Exporting for UI use
        isPending: mutation.isPending,
        error,
        setError,
        success,
        setSuccess
    };
};
