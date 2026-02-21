export enum QuoteStatus {
    PENDING = "PENDING",
    PROCESSED = "PROCESSED",
    CLOSED = "CLOSED",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}

export const QUOTE_STATUS_VALUES = Object.values(QuoteStatus);

export const DEFAULT_QUOTE_STATUS = QuoteStatus.PENDING;
