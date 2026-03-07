
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDraftOrder, type Quote } from "@/api/quotes";
import { usePlanUsage } from "./usePlanUsage";
import { PlanAction } from "../constants/plan.constants";

interface UseQuoteDraftOrderProps {
    quote: Quote | null;
}

export function useQuoteDraftOrder({ quote }: UseQuoteDraftOrderProps) {
    const queryClient = useQueryClient();
    const { hasPermission, isLoading: isPlanLoading } = usePlanUsage();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [localDraftOrderUrl, setLocalDraftOrderUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!quote) return;
        setSuccess(null);
        setLocalDraftOrderUrl(null);
        setError(null);
    }, [quote?.id]);

    const { mutate: handleCreateDraftOrder, isPending } = useMutation({
        mutationFn: () => {
            if (!quote) throw new Error("No quote selected");
            return createDraftOrder(quote.id);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['quotes'] });
            setSuccess("Draft order created successfully! You can now view the invoice.");
            setLocalDraftOrderUrl(data.invoiceUrl);
            setError(null);
            // Optionally refresh settings to update usage
            queryClient.invalidateQueries({ queryKey: ['settings'] });
        },
        onError: (err: Error) => {
            // Check for quota/plan errors to give better feedback
            setError(err.message);
            setSuccess(null);
        },
    });

    const isPro = hasPermission(PlanAction.DRAFT_ORDER_CREATE);
    const currentDraftOrderUrl = quote?.draftOrderUrl || localDraftOrderUrl;

    return {
        handleCreateDraftOrder,
        isPending,
        isPro,
        isSettingsLoading: isPlanLoading,
        error,
        success,
        currentDraftOrderUrl,
        setError,
        setSuccess
    };
}
