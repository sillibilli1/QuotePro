import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * cn() — class-name composition helper.
 *
 * Combines clsx (conditional/array class logic) with tailwind-merge
 * (deduplicates conflicting Tailwind utility classes, last one wins).
 *
 * Usage:
 *   cn('px-4 py-2', isActive && 'bg-teal-600', className)
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}
