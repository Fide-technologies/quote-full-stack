export interface Quote {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    productTitle: string;
    variantTitle?: string;
    quantity: number;
    address1?: string;
    address2?: string;
    city?: string;
    district?: string;
    state?: string;
    pincode?: string;
    customerMessage?: string;
    status: 'NEW' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEGOTIATION';
    createdAt: string;
    productId?: string;
    productDetails?: {
        featuredImage?: {
            url: string;
            altText: string;
        }
    }
    draftOrderId?: string;
    draftOrderUrl?: string;
    customData?: Record<string, any>;
    customImages?: string[];
}

export interface QuotesResponse {
    success: boolean;
    data: {
        quotes: Quote[];
        totalCount: number;
        page: number;
        limit: number;
        totalPages: number;
    }
}

export interface QuoteFilters {
    page?: number;
    limit?: number;
    q?: string;
    status?: string;
    date?: string;
    hasDraftOrder?: boolean;
}

export async function getQuotes(filters: QuoteFilters = {}): Promise<QuotesResponse['data']> {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.q) params.append("q", filters.q);
    if (filters.status) params.append("status", filters.status);
    if (filters.date) params.append("date", filters.date);
    if (filters.hasDraftOrder !== undefined) params.append("hasDraftOrder", filters.hasDraftOrder.toString());

    const res = await fetch(`/api/quotes?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch quotes");

    const json = await res.json();
    return json.data;
}

export async function createDraftOrder(quoteId: string): Promise<{ draftOrderId: string; invoiceUrl: string }> {
    const res = await fetch(`/api/draft-orders/${quoteId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        const error = await res.json();
        console.log("error is: ", error)
        throw new Error(error.message || "Failed to create draft order");
    }

    const json = await res.json();
    return json.data;
}
