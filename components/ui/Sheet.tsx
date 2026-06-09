'use client';

import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { type ReactNode } from 'react';
import { cn } from '@/lib/ui/cn';

// ── Re-exports ─────────────────────────────────────────────────────────────────
export const SheetRoot = RadixDialog.Root;
export const SheetTrigger = RadixDialog.Trigger;
export const SheetClose = RadixDialog.Close;

// ── Overlay ───────────────────────────────────────────────────────────────────
function SheetOverlay({ className }: { className?: string }) {
    return (
        <RadixDialog.Overlay
            className={cn(
                'fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]',
                'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
                className,
            )}
        />
    );
}

// ── Content ───────────────────────────────────────────────────────────────────
interface SheetContentProps {
    children: ReactNode;
    className?: string;
    title: string;
    description?: string;
    showClose?: boolean;
    onClose?: () => void;
}

export function SheetContent({
    children,
    className,
    title,
    description,
    showClose = true,
    onClose,
}: SheetContentProps) {
    return (
        <RadixDialog.Portal>
            <SheetOverlay />
            <RadixDialog.Content
                onCloseAutoFocus={(e) => e.preventDefault()}
                className={cn(
                    // Full-width bottom sheet on mobile; centered modal on sm+
                    'fixed bottom-0 left-0 right-0 z-50',
                    'sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:right-auto',
                    'sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2',
                    // Shape
                    'rounded-t-2xl sm:rounded-2xl',
                    'bg-surface border border-border shadow-modal',
                    'p-6 focus:outline-none',
                    // Animation
                    'data-[state=open]:animate-sheet-up sm:data-[state=open]:animate-zoom-in',
                    'data-[state=closed]:animate-sheet-down sm:data-[state=closed]:animate-zoom-out',
                    className,
                )}
            >
                <RadixDialog.Title className="sr-only">{title}</RadixDialog.Title>
                {description && (
                    <RadixDialog.Description className="sr-only">{description}</RadixDialog.Description>
                )}

                {/* Drag handle on mobile */}
                <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border sm:hidden" aria-hidden="true" />

                {showClose && (
                    <RadixDialog.Close
                        aria-label="Close"
                        onClick={onClose}
                        className={cn(
                            'absolute right-4 top-4 rounded-md p-1',
                            'text-text-tertiary transition hover:text-text-primary hover:bg-surface-subtle',
                            'focus:outline-none focus:ring-2 focus:ring-teal-500',
                        )}
                    >
                        <X className="h-4 w-4" aria-hidden="true" />
                    </RadixDialog.Close>
                )}

                {children}
            </RadixDialog.Content>
        </RadixDialog.Portal>
    );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export function SheetHeader({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn('mb-4 pr-6', className)}>{children}</div>;
}

export function SheetFooter({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn('mt-6 flex flex-col gap-2', className)}>
            {children}
        </div>
    );
}

export function SheetTitle({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <h2 className={cn('text-lg font-semibold text-text-primary', className)}>
            {children}
        </h2>
    );
}

export function SheetDescription({ children, className }: { children: ReactNode; className?: string }) {
    return <p className={cn('mt-1 text-sm text-text-secondary', className)}>{children}</p>;
}

// ── Convenience wrapper ───────────────────────────────────────────────────────
export interface SheetProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: ReactNode;
    title: string;
    description?: string;
    children: ReactNode;
    showClose?: boolean;
    className?: string;
}

export function Sheet({
    open,
    onOpenChange,
    trigger,
    title,
    description,
    children,
    showClose,
    className,
}: SheetProps) {
    return (
        <SheetRoot open={open} onOpenChange={onOpenChange}>
            {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
            <SheetContent title={title} description={description} showClose={showClose} className={className}>
                {children}
            </SheetContent>
        </SheetRoot>
    );
}
