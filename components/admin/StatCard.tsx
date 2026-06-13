'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    change?: number;
    icon?: React.ReactNode;
}

export default function StatCard({ title, value, change, icon }: StatCardProps) {
    const hasPositiveChange = change !== undefined && change > 0;
    const hasNegativeChange = change !== undefined && change < 0;

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-400">{title}</h3>
                {icon && <div className="text-gray-600">{icon}</div>}
            </div>
            <div className="flex items-end justify-between">
                <div className="text-3xl font-bold">{value}</div>
                {change !== undefined && (
                    <div className={`flex items-center gap-1 text-sm ${hasPositiveChange ? 'text-green-500' : hasNegativeChange ? 'text-red-500' : 'text-gray-500'}`}>
                        {hasPositiveChange && <TrendingUp className="w-4 h-4" />}
                        {hasNegativeChange && <TrendingDown className="w-4 h-4" />}
                        {Math.abs(change)}%
                    </div>
                )}
            </div>
        </div>
    );
}
