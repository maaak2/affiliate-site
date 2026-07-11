export const CURRENCIES = ["SAR", "USD", "AED", "KWD", "EUR", "GBP"] as const;
export type Currency = (typeof CURRENCIES)[number];
