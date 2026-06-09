'use client';

import { useEffect } from 'react';

/**
 * Mounts a single IntersectionObserver that adds [data-revealed]
 * to every .reveal-up element when it scrolls into view.
 * Renders nothing — pure side-effect component.
 * Safe with prefers-reduced-motion: CSS only animates when
 * motion is allowed; this just sets the attribute unconditionally.
 */
export function ScrollRevealInit() {
    useEffect(() => {
        const targets = document.querySelectorAll<HTMLElement>('.reveal-up');

        if (!targets.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        (entry.target as HTMLElement).dataset.revealed = '';
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12 },
        );

        targets.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return null;
}
