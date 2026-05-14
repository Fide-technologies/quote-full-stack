import type { Quote } from "../api/quotes";

export interface QuoteFiltersProps {
    queryValue: string;
    statusFilter: string[];
    dateFilter: string;
    onQueryChange: (value: string) => void;
    onQueryClear: () => void;
    onStatusChange: (value: string[]) => void;
    onDateChange: (value: string) => void;
    onClearAll: () => void;
    onSearch?: () => void;
}

export interface QuoteTableProps {
    quotes: Quote[];
    isLoading: boolean;
    page: number;
    totalPages: number;
    totalCount: number;
    onNextPage: () => void;
    onPrevPage: () => void;
    onViewDetails: (quote: Quote) => void;
}
