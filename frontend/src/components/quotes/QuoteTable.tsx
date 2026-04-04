import {
    Badge,
    BlockStack,
    Button,
    EmptySearchResult,
    IndexTable,
    InlineStack,
    Text,
    Thumbnail,
    useBreakpoints,
    useIndexResourceState,
} from "@shopify/polaris";
import { ImageIcon, ViewIcon } from "@shopify/polaris-icons";
import type { Quote } from "../../api/quotes";

interface QuoteTableProps {
    quotes: Quote[];
    isLoading: boolean;
    page: number;
    totalPages: number;
    totalCount: number;
    onNextPage: () => void;
    onPrevPage: () => void;
    onViewDetails: (quote: Quote) => void;
}

export function QuoteTable({
    quotes,
    isLoading,
    page,
    totalPages,
    totalCount,
    onNextPage,
    onPrevPage,
    onViewDetails,
}: QuoteTableProps) {
    const { smUp } = useBreakpoints();

    const resourceName = {
        singular: "quote",
        plural: "quotes",
    };

    const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(
        quotes as unknown as Record<string, unknown>[],
    );

    const rowMarkup = quotes.map((quote, index) => (
        <IndexTable.Row
            id={quote.id}
            key={quote.id}
            selected={selectedResources.includes(quote.id)}
            position={index}
        >
            <IndexTable.Cell>
                <Text variant="bodyMd" fontWeight="bold" as="span">
                    {quote.firstName} {quote.lastName}
                </Text>
            </IndexTable.Cell>
            <IndexTable.Cell>{quote.email}</IndexTable.Cell>
            <IndexTable.Cell>
                <InlineStack gap="300" align="start" blockAlign="center" wrap>
                    <Thumbnail
                        source={quote.productDetails?.featuredImage?.url || ImageIcon}
                        alt={quote.productDetails?.featuredImage?.altText || quote.productTitle}
                        size="small"
                    />
                    <BlockStack gap="050">
                        <Text as="span" fontWeight="semibold">
                            {quote.productTitle || "General Inquiry"}
                        </Text>
                        {quote.variantTitle && quote.variantTitle !== "Default Title" && (
                            <Text as="span" variant="bodySm" tone="subdued">
                                {quote.variantTitle}
                            </Text>
                        )}
                    </BlockStack>
                </InlineStack>
            </IndexTable.Cell>
            <IndexTable.Cell>{quote.quantity}</IndexTable.Cell>
            <IndexTable.Cell>
                <BlockStack gap="100">
                    <Badge
                        tone={
                            quote.status === "NEW"
                                ? "attention"
                                : quote.status === "PENDING"
                                  ? "info"
                                  : quote.status === "APPROVED"
                                    ? "success"
                                    : quote.status === "REJECTED"
                                      ? "critical"
                                      : quote.status === "NEGOTIATION"
                                        ? "warning"
                                        : "info"
                        }
                    >
                        {quote.status}
                    </Badge>
                    {quote.draftOrderId && <Badge tone="success">Draft Created</Badge>}
                    {quote.customImages && quote.customImages.length > 0 && <Badge tone="info">Images</Badge>}
                </BlockStack>
            </IndexTable.Cell>
            <IndexTable.Cell>{new Date(quote.createdAt).toLocaleDateString()}</IndexTable.Cell>
            <IndexTable.Cell>
                <Button
                    icon={ViewIcon}
                    onClick={() => onViewDetails(quote)}
                    variant="plain"
                    accessibilityLabel="View Details"
                />
            </IndexTable.Cell>
        </IndexTable.Row>
    ));

    return (
        <IndexTable
            condensed={!smUp}
            resourceName={resourceName}
            itemCount={totalCount}
            selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
            onSelectionChange={handleSelectionChange}
            headings={[
                { title: "Customer" },
                { title: "Email" },
                { title: "Product" },
                { title: "Qty" },
                { title: "Status" },
                { title: "Date" },
                { title: "Actions", hidden: true },
            ]}
            selectable={false}
            pagination={{
                hasNext: page < totalPages,
                hasPrevious: page > 1,
                onNext: onNextPage,
                onPrevious: onPrevPage,
            }}
            loading={isLoading}
            emptyState={
                <EmptySearchResult
                    title={"No quotes found"}
                    description={"Try changing the filters or search term"}
                    withIllustration
                />
            }
        >
            {rowMarkup}
        </IndexTable>
    );
}
