'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { RevisionEntry } from '@/types';

interface RevisionChatProps {
    revisions: RevisionEntry[];
    revisionsRemaining: number;
    isRevising: boolean;
    errorMessage: string | null;
    onRevise: (instruction: string) => void;
}

function formatTime(isoString: string) {
    try {
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
        return '';
    }
}

export function RevisionChat({
    revisions,
    revisionsRemaining,
    isRevising,
    errorMessage,
    onRevise,
}: RevisionChatProps) {
    const [instruction, setInstruction] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = instruction.trim();
        if (!trimmed || isRevising || revisionsRemaining <= 0) return;
        onRevise(trimmed);
        setInstruction('');
    };

    const isDisabled = isRevising || revisionsRemaining <= 0;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-light">
                    AI Revision Chat
                </p>
                <p className="text-xs text-slate-500">
                    {revisionsRemaining} {revisionsRemaining === 1 ? 'change' : 'changes'} left
                </p>
            </div>

            {/* Revision history */}
            {revisions.length > 0 && (
                <div className="space-y-2">
                    {revisions.map((rev, index) => (
                        <div
                            key={index}
                            className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-sm"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <p className="flex-1 text-slate-200">{rev.instruction}</p>
                                <span className="shrink-0 text-xs text-slate-500">{formatTime(rev.at)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Error message */}
            {errorMessage && (
                <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {errorMessage}
                </p>
            )}

            {/* Input form */}
            <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder={
                        revisionsRemaining <= 0
                            ? 'Revision limit reached'
                            : 'e.g. make it 10% cheaper or add plumbing'
                    }
                    disabled={isDisabled}
                    className="flex-1"
                />
                <Button
                    type="submit"
                    variant="secondary"
                    size="md"
                    disabled={isDisabled || !instruction.trim()}
                    loading={isRevising}
                    className="shrink-0 border-brand/40 bg-brand/10 text-brand-light hover:border-brand hover:bg-brand/20"
                >
                    {isRevising ? (
                        'Revising...'
                    ) : (
                        <>
                            <Send className="h-4 w-4" aria-hidden="true" />
                        </>
                    )}
                </Button>
            </form>

            {revisionsRemaining <= 0 && (
                <p className="text-xs text-slate-500">
                    You've reached the revision limit for this quote. You can still save it or start over.
                </p>
            )}
        </div>
    );
}
