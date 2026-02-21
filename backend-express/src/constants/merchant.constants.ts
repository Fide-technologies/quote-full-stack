export enum SubscriptionStatus {
    ACTIVE = "ACTIVE",
    CANCELLED = "CANCELLED",
    TRIAL = "TRIAL",
    FROZEN = "FROZEN",
}

export const SUBSCRIPTION_STATUS_VALUES = Object.values(SubscriptionStatus);
export const DEFAULT_SUBSCRIPTION_STATUS = SubscriptionStatus.TRIAL;
