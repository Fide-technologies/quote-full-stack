import {
    Box,
    Filters,
    Button,
    ChoiceList,
    TextField,
} from '@shopify/polaris';

interface QuoteFiltersProps {
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

export function QuoteFilters({
    queryValue,
    statusFilter,
    dateFilter,
    onQueryChange,
    onQueryClear,
    onStatusChange,
    onDateChange,
    onClearAll,
    onSearch,
}: QuoteFiltersProps) {

    const filters = [
        {
            key: 'status',
            label: 'Status',
            filter: (
                <ChoiceList
                    title="Status"
                    titleHidden
                    choices={[
                        { label: 'New', value: 'NEW' },
                        { label: 'Pending', value: 'PENDING' },
                        { label: 'Approved', value: 'APPROVED' },
                        { label: 'Rejected', value: 'REJECTED' },
                        { label: 'Negotiation', value: 'NEGOTIATION' },
                    ]}
                    selected={statusFilter}
                    onChange={onStatusChange}
                    allowMultiple={false}
                />
            ),
            shortcut: true,
        },
        {
            key: 'date',
            label: 'Date',
            filter: (
                <TextField
                    label="Date"
                    type="date"
                    value={dateFilter}
                    onChange={onDateChange}
                    autoComplete="off"
                    labelHidden
                />
            ),
            shortcut: true,
        },
    ];

    const appliedFilters = [];
    if (statusFilter.length > 0) {
        appliedFilters.push({
            key: 'status',
            label: `Status: ${statusFilter[0]}`,
            onRemove: () => onStatusChange([]),
        });
    }
    if (dateFilter) {
        appliedFilters.push({
            key: 'date',
            label: `Date: ${dateFilter}`,
            onRemove: () => onDateChange(''),
        });
    }

    return (
        <Box padding="400" borderBlockEndWidth="025" borderColor="border-secondary">
            <Filters
                queryValue={queryValue}
                filters={filters}
                appliedFilters={appliedFilters}
                onQueryChange={onQueryChange}
                onQueryClear={onQueryClear}
                onClearAll={onClearAll}
                queryPlaceholder="Search customers, products..."
            >
                <Box paddingBlockStart="200">
                    <Button onClick={onSearch}>Search</Button>
                </Box>
            </Filters>
        </Box>
    );
}
