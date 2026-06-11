'use client';

function formatCurrency(value: number, currencyCode: string) {
    return new Intl.NumberFormat('en', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

type TotalsDisplayProps = {
    subtotal: number;
    vat: number;
    total: number;
    currencyCode: string;
    taxRate?: number;
};

export function TotalsDisplay({ subtotal, vat, total, currencyCode, taxRate = 5 }: TotalsDisplayProps) {
    return (
        <div className="space-y-3 rounded-2xl border border-brand/20 bg-brand/5 p-5 text-sm text-slate-200">
            <div className="flex items-center justify-between gap-4">
                <span>Subtotal</span>
                <span className="font-medium text-white">{formatCurrency(subtotal, currencyCode)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
                <span>VAT {taxRate}%</span>
                <span className="font-medium text-white">{formatCurrency(vat, currencyCode)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-brand/20 pt-3 text-base">
                <span className="font-semibold text-white">Total</span>
                <span className="font-semibold text-white">{formatCurrency(total, currencyCode)}</span>
            </div>
        </div>
    );
}
