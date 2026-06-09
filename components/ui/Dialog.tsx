'use client';

import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { type ReactNode } from 'react';
import { cn } from '@/lib/ui/cn';

// ── Re-exports for flexible composition ───────────────────────────────────────
export const DialogRoot = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;

// ── Overlay ───────────────────────────────────────────────────────────────────
function DialogOverlay({ className }: { className?: string }) {
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
interface DialogContentProps {
    children: ReactNode;
    className?: string;
    /** Accessible title (required for screen readers) */
    title: string;
    /** Optional description */
    description?: string;
    /** Show the default close (×) button in the corner */
    showClose?: boolean;
    onClose?: () => void;
}

export function DialogContent({
    children,
    className,
    title,
    description,
    showClose = true,
    onClose,
}: DialogContentProps) {
    return (
        <RadixDialog.Portal>
            <DialogOverlay />
            <RadixDialog.Content
                onCloseAutoFocus={(e) => e.preventDefault()}
                className={cn(
                    'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2',
                    'rounded-2xl bg-surface border border-border shadow-modal',
                    'p-6 focus:outline-none',
                    'data-[state=open]:animate-zoom-in data-[state=closed]:animate-zoom-out',
                    className,
                )}
            >
                {/* Hidden but accessible title */}
                <RadixDialog.Title className="sr-only">{title}</RadixDialog.Title>
                {description && (
                    <RadixDialog.Description className="sr-only">{description}</RadixDialog.Description>
                )}

                {showClose && (
                    <RadixDialog.Close
                        aria-label="Close dialog"
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

// ── Compound Dialog header / footer helpers ───────────────────────────────────
export function DialogHeader({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn('mb-4 pr-6', className)}>
            {children}
        </div>
    );
}

export function DialogFooter({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn('mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}>
            {children}
        </div>
    );
}

export function DialogTitle({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <h2 className={cn('text-lg font-semibold text-text-primary', className)}>
            {children}
        </h2>
    );
}

export function DialogDescription({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <p className={cn('mt-1 text-sm text-text-secondary', className)}>
            {children}
        </p>
    );
}

// ── Convenience wrapper ───────────────────────────────────────────────────────
export interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: ReactNode;
    title: string;
    description?: string;
    children: ReactNode;
    showClose?: boolean;
    className?: string;
}

export function Dialog({
    open,
    onOpenChange,
    trigger,
    title,
    description,
    children,
    showClose,
    className,
}: DialogProps) {
    return (
        <DialogRoot open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent title={title} description={description} showClose={showClose} className={className}>
                {children}
            </DialogContent>
        </DialogRoot>
    );
}
