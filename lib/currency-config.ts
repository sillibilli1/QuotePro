export interface CurrencyConfig {
    symbol: string;
    tax: number;
    label: string;
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
    AED: { symbol: 'AED', tax: 5, label: 'UAE Dirham' },
    PKR: { symbol: 'Rs', tax: 18, label: 'Pakistani Rupee' },
    USD: { symbol: '$', tax: 0, label: 'US Dollar' },
    GBP: { symbol: '£', tax: 20, label: 'British Pound' },
    SAR: { symbol: 'SAR', tax: 15, label: 'Saudi Riyal' },
};

export const DEFAULT_CURRENCY = 'AED';

export function detectCurrencyFromTimezone(): string {
    try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timezone.includes('Dubai') || timezone.includes('Abu_Dhabi')) return 'AED';
        if (timezone.includes('Karachi') || timezone.includes('Lahore')) return 'PKR';
        if (timezone.includes('Riyadh') || timezone.includes('Jeddah')) return 'SAR';
        if (timezone.includes('London')) return 'GBP';
        if (timezone.includes('New_York') || timezone.includes('Los_Angeles') || timezone.includes('Chicago')) return 'USD';
    } catch {
        // Ignore errors
    }
    return DEFAULT_CURRENCY;
}
