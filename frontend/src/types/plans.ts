export interface Feature {
    text: string;
    included: boolean;
    bold?: boolean;
    highlighted?: boolean;
}

export interface Plan {
    id: string;
    name: string;
    price: string;
    period: string;
    description: string;
    isPopular?: boolean;
    trialDays?: number;
    features: Feature[];
}
