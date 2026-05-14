import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQuotes, type Quote } from '../../api/quotes';

export function useQuotes(config: { hasDraftOrder?: boolean } = {}) {
    const [queryValue, setQueryValue] = useState('');
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [dateFilter, setDateFilter] = useState('');
    const [page, setPage] = useState(1);
    const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['quotes', page, queryValue, statusFilter, dateFilter, config.hasDraftOrder],
        queryFn: () => getQuotes({
            page,
            limit: 10,
            q: queryValue,
            status: statusFilter[0],
            date: dateFilter,
            hasDraftOrder: config.hasDraftOrder
        }),
        placeholderData: (previousData) => previousData,
    });

    const quotes = data?.quotes || [];
    const totalCount = data?.totalCount || 0;
    const totalPages = data?.totalPages || 1;

    const selectedQuote = quotes.find(q => q.id === selectedQuoteId) || null;

    const handleQueryChange = useCallback((value: string) => {
        setQueryValue(value);
        setPage(1);
    }, []);

    const handleQueryClear = useCallback(() => {
        setQueryValue('');
        setPage(1);
    }, []);

    const handleStatusChange = useCallback((value: string[]) => {
        setStatusFilter(value);
        setPage(1);
    }, []);

    const handleDateChange = useCallback((value: string) => {
        setDateFilter(value);
        setPage(1);
    }, []);

    const handleClearAll = useCallback(() => {
        setQueryValue('');
        setStatusFilter([]);
        setDateFilter('');
        setPage(1);
    }, []);

    const handleNextPage = useCallback(() => setPage(p => p + 1), []);
    const handlePrevPage = useCallback(() => setPage(p => p - 1), []);

    const openDetails = useCallback((quote: Quote) => {
        setSelectedQuoteId(quote.id);
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setSelectedQuoteId(null);
        setIsModalOpen(false);
    }, []);

    const handleSearchBlur = useCallback(() => {
        console.log('Search blur triggered');
    }, []);

    return {
        // Data
        quotes,
        totalCount,
        totalPages,
        isLoading,
        isError,
        error,
        refetch,

        // Filters State
        queryValue,
        statusFilter,
        dateFilter,
        page,

        // Modal State
        selectedQuote,
        isModalOpen,

        // Handlers
        handleQueryChange,
        handleQueryClear,
        handleStatusChange,
        handleDateChange,
        handleClearAll,
        handleNextPage,
        handlePrevPage,
        handleSearchBlur,
        openDetails,
        closeModal
    };
}
