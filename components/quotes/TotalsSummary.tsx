'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface TotalsSummaryProps {
    subtotal: number;
    vat: number;
    total: number;
    currencyCode: string;
}

function formatMono(value: number, currencyCode: string) {
    return new Intl.NumberFormat('en', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

/** Flashes teal briefly whenever `value` changes */
function FlashingNumber({
    value,
    currencyCode,
    className = '',
}: {
    value: number;
    currencyCode: string;
    className?: string;
}) {
    const reduceMotion = useReducedMotion();
    const [flash, setFlash] = useState(false);
    const prevRef = useRef(value);

    useEffect(() => {
        if (prevRef.current !== value) {
            prevRef.current = value;
            if (!reduceMotion) {
                setFlash(true);
                const t = setTimeout(() => setFlash(false), 500);
                return () => clearTimeout(t);
            }
        }
    }, [value, reduceMotion]);

    return (
        <motion.span
            className={[
                'font-mono tabular-nums transition-colors duration-300',
                flash ? 'text-teal-400' : 'text-white',
                className,
            ].join(' ')}
        >
            {formatMono(value, currencyCode)}
        </motion.span>
    );
}

export function TotalsSummary({ subtotal, vat, total, currencyCode }: TotalsSummaryProps) {
    const rows = [
        { label: 'Subtotal', value: subtotal, bold: false },
        { label: 'VAT (5%)', value: vat, bold: false },
        { label: 'Total', value: total, bold: true },
    ];

    return (
        <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Summary</p>
            <div className="space-y-2">
                {rows.map(({ label, value, bold }) => (
                    <div key={label} className={`flex items-center justify-between gap-4 ${bold ? 'border-t border-slate-700 pt-2' : ''}`}>
                        <span className={`text-sm ${bold ? 'font-semibold text-white' : 'text-slate-400'}`}>
                            {label}
                        </span>
                        <FlashingNumber
                            value={value}
                            currencyCode={currencyCode}
                            className={bold ? 'text-base font-bold' : 'text-sm'}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
