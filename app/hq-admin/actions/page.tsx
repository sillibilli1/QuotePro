'use client';

import { useState } from 'react';

export default function ActionsPage() {
    const [exporting, setExporting] = useState(false);

    const handleExport = async (type: 'users' | 'quotes') => {
        setExporting(true);
        const res = await fetch('/api/admin/actions/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type }),
        });
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-export-${Date.now()}.csv`;
        a.click();
        setExporting(false);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Quick Actions</h1>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Export Data</h2>
                <div className="flex gap-4">
                    <button onClick={() => handleExport('users')} disabled={exporting} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
                        {exporting ? 'Exporting...' : 'Export Users CSV'}
                    </button>
                    <button onClick={() => handleExport('quotes')} disabled={exporting} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
                        {exporting ? 'Exporting...' : 'Export Quotes CSV'}
                    </button>
                </div>
            </div>
        </div>
    );
}
