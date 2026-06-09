type LoadingSpinnerProps = {
    label?: string;
    className?: string;
};

export function LoadingSpinner({
    label = 'Generating your quote... this takes about 10 seconds',
    className,
}: LoadingSpinnerProps) {
    return (
        <div
            className={[
                'flex items-center gap-3 rounded-2xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-teal-50',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            role="status"
            aria-live="polite"
        >
            <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-brand-light border-t-transparent" />
            <span>{label}</span>
        </div>
    );
}
