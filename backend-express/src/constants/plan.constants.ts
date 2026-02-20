export enum PlanType {
    FREE = "FREE",
    PRO = "PRO",
}

export const PLAN_TYPE_VALUES = Object.values(PlanType);

export enum PlanAction {
    QUOTE_CREATE = "quote:create",
    QUOTE_UPDATE = "quote:update",
    QUOTE_SEND = "quote:send",
    DRAFT_ORDER_CREATE = "draft_order:create",
    SETTINGS_UPDATE = "settings:update",
    CUSTOM_FORM_BUILDER = "form:builder",
    REMOVE_BRANDING = "app:branding",
    MERCHANT_EMAIL_NOTIFICATIONS = "email:notifications"
}

export const PLAN_ACTION_VALUES = Object.values(PlanAction);
