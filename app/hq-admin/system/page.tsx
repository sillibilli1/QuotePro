'use client';

import { useState, useEffect } from 'react';

interface Log {
    id: string;
    event_type: string;
    details: any;
    created_at: string;
}

export default function SystemPage() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [eventType, setEventType] = useState('all');

    useEffect(() => {
        fetch(`/api/admin/logs?type=${eventType}`)
            .then(res => res.json())
            .then(data => setLogs(data.logs || []));
    }, [eventType]);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">System Logs & Health</h1>
            <select value={eventType} onChange={(e) => setEventType(e.target.value)} className="mb-6 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg">
                <option value="all">All Events</option>
                <option value="admin_action">Admin Actions</option>
                <option value="error">Errors</option>
            </select>
            <div className="overflow-x-auto">
                <table className="w-full border border-gray-800 rounded-lg">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="px-4 py-3 text-left">Type</th>
                            <th className="px-4 py-3 text-left">Details</th>
                            <th className="px-4 py-3 text-left">Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log.id} className="border-t border-gray-800 hover:bg-gray-900/50">
                                <td className="px-4 py-3">
                                    <span className="px-2 py-1 rounded text-xs bg-gray-800">{log.event_type}</span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-400">{JSON.stringify(log.details).substring(0, 100)}...</td>
                                <td className="px-4 py-3 text-sm text-gray-400">{new Date(log.created_at).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
