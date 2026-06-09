'use client';

import { useReducedMotion, motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

interface PageTransitionProps {
    children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
    const pathname = usePathname();
    const reduceMotion = useReducedMotion();

    const variants = reduceMotion
        ? {
            initial: {},
            animate: {},
            exit: {},
        }
        : {
            initial: { opacity: 0, y: 8 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -4 },
        };

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={pathname}
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={
                    reduceMotion
                        ? {}
                        : {
                            duration: 0.25,
                            ease: 'easeOut',
                        }
                }
                style={{ willChange: 'opacity, transform' }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
