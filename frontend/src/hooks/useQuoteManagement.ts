import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { deleteQuote, updateQuoteStatus, type Quote } from "@/api/quotes";


import { useNotifications } from "./useNotifications";

export function useQuoteManagement() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { showToast } = useNotifications();

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteQuote(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quotes'] });
            showToast({ content: "Quote deleted successfully." });
            navigate('/quotes');
        },
        onError: (err: Error) => {
            showToast({ content: err.message, error: true });
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: Quote['status'] }) =>
            updateQuoteStatus(id, status),
        onSuccess: (updatedQuote) => {
            queryClient.invalidateQueries({ queryKey: ['quotes'] });
            queryClient.invalidateQueries({ queryKey: ['quote', updatedQuote.id] });
            showToast({ content: `Status updated to ${updatedQuote.status} successfully.` });
        },
        onError: (err: Error) => {
            showToast({ content: err.message, error: true });
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
    };
}

