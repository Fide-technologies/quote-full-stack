import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { deleteQuote, updateQuoteStatus, type Quote } from "@/api/quotes";
import { useState } from "react";

export function useQuoteManagement() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteQuote(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quotes'] });
            setSuccess("Quote deleted successfully.");
            navigate('/quotes');
        },
        onError: (err: Error) => {
            setError(err.message);
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: Quote['status'] }) =>
            updateQuoteStatus(id, status),
        onSuccess: (updatedQuote) => {
            queryClient.invalidateQueries({ queryKey: ['quotes'] });
            queryClient.invalidateQueries({ queryKey: ['quote', updatedQuote.id] });
            setSuccess(`Status updated to ${updatedQuote.status} successfully.`);
            setError(null);
        },
        onError: (err: Error) => {
            setError(err.message);
        }
    });

    return {
        handleDelete: (id: string) => {
            deleteMutation.mutate(id);
        },
        handleStatusChange: (id: string, status: Quote['status']) => {
            updateStatusMutation.mutate({ id, status });
        },
        isDeleting: deleteMutation.isPending,
        isUpdatingStatus: updateStatusMutation.isPending,
        error,
        setError,
        success,
        setSuccess
    };
}
