'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/ui/cn';

// ── Types ──────────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
    id: number;
    message: string;
    type: ToastType;
}

// ── Icon map ───────────────────────────────────────────────────────────────────
const TypeIcon: Record<ToastType, React.ElementType> = {
    success: CheckCircle2,
    error: XCircle,
    info: Info,
};

const typeStyles: Record<ToastType, string> = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-rose-50 border-rose-200 text-rose-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const iconStyles: Record<ToastType, string> = {
    success: 'text-emerald-500',
    error: 'text-rose-500',
    info: 'text-blue-500',
};

// ── Single toast ───────────────────────────────────────────────────────────────
interface SingleToastProps {
    item: ToastItem;
    onClose: (id: number) => void;
}

function SingleToast({ item, onClose }: SingleToastProps) {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const Icon = TypeIcon[item.type];

    useEffect(() => {
        timerRef.current = setTimeout(() => onClose(item.id), 3000);
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [item.id, onClose]);

    return (
        <div
            role="status"
            aria-live="polite"
            className={cn(
                'flex min-w-[280px] max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-pop',
                'animate-slide-up',
                typeStyles[item.type],
            )}
        >
            <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', iconStyles[item.type])} aria-hidden="true" />
            <span className="flex-1 text-sm font-medium leading-snug">{item.message}</span>
            <button
                onClick={() => onClose(item.id)}
                aria-label="Dismiss notification"
                className="shrink-0 rounded p-0.5 opacity-60 transition hover:opacity-100"
            >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
        </div>
    );
}

// ── Toast container (stacking) ─────────────────────────────────────────────────
interface ToastContainerProps {
    toasts: ToastItem[];
    onClose: (id: number) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
    if (toasts.length === 0) return null;

    return (
        <div
            aria-label="Notifications"
            className="fixed left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2"
            style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
        >
            {toasts.map((t) => (
                <SingleToast key={t.id} item={t} onClose={onClose} />
            ))}
        </div>
    );
}

// ── Legacy single-toast API (backward compat) ──────────────────────────────────
export interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
    return (
        <ToastContainer
            toasts={[{ id: 0, message, type }]}
            onClose={onClose}
        />
    );
}

// ── Hook ───────────────────────────────────────────────────────────────────────
interface ToastState {
    message: string;
    type: ToastType;
    id: number;
}

/** Single-toast hook — backward compatible with existing callers. */
export function useToast() {
    const [toast, setToast] = useState<ToastState | null>(null);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        setToast({ message, type, id: Date.now() });
    }, []);

    const hideToast = useCallback(() => setToast(null), []);

    return { toast, showToast, hideToast };
}

/** Multi-toast hook. */
export function useToasts() {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'success') => {
        setToasts((prev) => [...prev, { id: Date.now(), message, type }]);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return { toasts, addToast, removeToast };
}
