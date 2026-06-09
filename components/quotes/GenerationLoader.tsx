'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const STAGES = [
    { label: 'Analyzing project…', duration: 2500 },
    { label: 'Pricing line items…', duration: 3000 },
    { label: 'Applying 5% VAT…', duration: 2500 },
    { label: 'Finalizing quote…', duration: 2000 },
] as const;

interface GenerationLoaderProps {
    /** When true the loader is visible; when false it fades out immediately */
    active: boolean;
}

export function GenerationLoader({ active }: GenerationLoaderProps) {
    const [stageIndex, setStageIndex] = useState(0);
    const reduceMotion = useReducedMotion();
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Advance through stages while active
    useEffect(() => {
        if (!active) {
            // Reset for next use
            setStageIndex(0);
            return;
        }

        function schedule(index: number) {
            if (index >= STAGES.length - 1) return;
            timerRef.current = setTimeout(() => {
                setStageIndex(index + 1);
                schedule(index + 1);
            }, STAGES[index].duration);
        }

        setStageIndex(0);
        schedule(0);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [active]);

    if (!active) return null;

    const currentLabel = STAGES[Math.min(stageIndex, STAGES.length - 1)].label;
    const progress = ((stageIndex + 1) / STAGES.length) * 100;

    return (
        <div
            role="status"
            aria-live="polite"
            aria-label="Generating quote"
            className="flex flex-col items-center gap-6 py-10"
        >
            {/* Spinning ring */}
            <div className="relative h-16 w-16">
                <svg
                    className="absolute inset-0 h-full w-full -rotate-90"
                    viewBox="0 0 64 64"
                    aria-hidden="true"
                >
                    <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="text-slate-700"
                    />
                    <motion.circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        className="text-brand"
                        strokeDasharray={2 * Math.PI * 28}
                        animate={
                            reduceMotion
                                ? { strokeDashoffset: 2 * Math.PI * 28 * (1 - progress / 100) }
                                : { strokeDashoffset: 2 * Math.PI * 28 * (1 - progress / 100) }
                        }
                        initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </svg>
                {/* Pulsing dot in center */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={reduceMotion ? {} : { scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <div className="h-3 w-3 rounded-full bg-brand" />
                </motion.div>
            </div>

            {/* Stage label */}
            <div className="h-7 overflow-hidden text-center">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.p
                        key={stageIndex}
                        className="text-base font-medium text-white"
                        initial={reduceMotion ? {} : { opacity: 0, y: 10 }}
                        animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
                        exit={reduceMotion ? {} : { opacity: 0, y: -10 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                    >
                        {currentLabel}
                    </motion.p>
                </AnimatePresence>
            </div>

            {/* Stage dots */}
            <div className="flex items-center gap-2" aria-hidden="true">
                {STAGES.map((_, i) => (
                    <motion.div
                        key={i}
                        className="h-1.5 rounded-full bg-brand"
                        animate={
                            reduceMotion
                                ? { opacity: i <= stageIndex ? 1 : 0.25, width: i === stageIndex ? 24 : 6 }
                                : { opacity: i <= stageIndex ? 1 : 0.25, width: i === stageIndex ? 24 : 6 }
                        }
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        initial={{ width: 6, opacity: 0.25 }}
                    />
                ))}
            </div>

            <p className="text-sm text-slate-400">
                This usually takes 5–15 seconds…
            </p>
        </div>
    );
}
