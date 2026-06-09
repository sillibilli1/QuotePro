import { Skeleton } from '@/components/ui/Skeleton';

export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            {/* Stats row */}
            <div className="grid gap-4 sm:grid-cols-3">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/80 p-5"
                    >
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-3 w-24 rounded-full" />
                            <Skeleton className="h-8 w-8 rounded-lg" />
                        </div>
                        <Skeleton className="h-8 w-28 rounded-xl" />
                    </div>
                ))}
            </div>

            {/* Usage bar */}
            <div className="space-y-1.5">
                <div className="flex justify-between">
                    <Skeleton className="h-3 w-32 rounded-full" />
                    <Skeleton className="h-3 w-8 rounded-full" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
            </div>

            {/* Quote list */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/80">
                <div className="border-b border-slate-800 px-5 py-4">
                    <Skeleton className="h-5 w-32 rounded-xl" />
                </div>
                <div className="divide-y divide-slate-800">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between gap-4 px-5 py-4">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-28 rounded-lg" />
                                    <Skeleton className="h-4 w-16 rounded-full" />
                                </div>
                                <div className="flex gap-3">
                                    <Skeleton className="h-3 w-24 rounded-full" />
                                    <Skeleton className="h-3 w-16 rounded-full" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-20 rounded-lg" />
                                <Skeleton className="h-8 w-8 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
