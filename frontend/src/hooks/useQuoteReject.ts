import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { rejectQuote, type Quote } from "@/api/quotes";

interface UseQuoteRejectProps {
    quote: Quote | null;
}

export const REJECTION_REASONS = [
    { label: 'Out of stock', value: 'OUT_OF_STOCK', text: 'Unfortunately, we are currently out of stock for this item and cannot fulfill your request.' },
    { label: 'Shipping not available', value: 'SHIPPING_UNAVAILABLE', text: 'We are sorry, but we currently do not offer shipping to your specified location.' },
    { label: 'Price too low', value: 'PRICE_TOO_LOW', text: 'We are unable to accept the proposed price. It falls below our minimum threshold for this product quantity.' },
    { label: 'Minimum Order Quantity not met', value: 'MOQ_NOT_MET', text: 'This product has a minimum order quantity that has not been met in your request.' },
    { label: 'Other', value: 'OTHER', text: '' },
];

export function useQuoteReject({ quote }: UseQuoteRejectProps) {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReason, setSelectedReason] = useState(REJECTION_REASONS[0].value);
    const [customMessage, setCustomMessage] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: (rejectionData: { message: string }) => 
            rejectQuote(quote!.id, rejectionData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quotes'] });
            queryClient.invalidateQueries({ queryKey: ['quote', quote?.id] });
            setSuccess("Quote rejected and email sent successfully.");
            setIsModalOpen(false);
            setCustomMessage("");
            setSelectedReason(REJECTION_REASONS[0].value);
        },
        onError: (err: Error) => {
            setError(err.message);
        }
    });

    const handleReject = () => {
        if (!quote) return;
        
        const reason = REJECTION_REASONS.find(r => r.value === selectedReason);
        const finalMessage = selectedReason === 'OTHER' ? customMessage : (reason?.text || "");
        
        if (selectedReason === 'OTHER' && !customMessage.trim()) {
            setError("Please provide a reason for the rejection.");
            return;
        }

        mutation.mutate({ message: finalMessage });
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setError(null);
    };

    return {
        isModalOpen,
        openModal,
        closeModal,
        selectedReason,
        setSelectedReason,
        customMessage,
        setCustomMessage,
        handleReject,
        isPending: mutation.isPending,
        error,
        setError,
        success,
        setSuccess
    };
}
