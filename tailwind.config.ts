import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './lib/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Existing brand alias — kept for backward compat
                brand: {
                    DEFAULT: '#0D9488',
                    dark: '#0f766e',
                    light: '#ccfbf1',
                },
                // Full teal scale — #0D9488 lives at teal-600
                teal: {
                    50: '#F0FDFA',
                    100: '#CCFBF1',
                    200: '#99F6E4',
                    300: '#5EEAD4',
                    400: '#2DD4BF',
                    500: '#14B8A6',
                    600: '#0D9488',
                    700: '#0F766E',
                    800: '#115E59',
                    900: '#134E4A',
                },
                // Semantic surface / text / border tokens (mapped from CSS variables)
                bg: 'var(--bg)',
                surface: 'var(--surface)',
                'surface-subtle': 'var(--surface-subtle)',
                border: { DEFAULT: 'var(--border)' },
                'text-primary': 'var(--text-primary)',
                'text-secondary': 'var(--text-secondary)',
                'text-tertiary': 'var(--text-tertiary)',
                accent: 'var(--accent)',
                'accent-hover': 'var(--accent-hover)',
                // Status tokens
                status: {
                    draft: '#71717A', // zinc-500
                    sent: '#2563EB', // blue-600
                    pending: '#F59E0B', // amber-500
                    won: '#059669', // emerald-600
                    lost: '#E11D48', // rose-600
                },
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
                mono: ['var(--font-inter)', 'ui-monospace', 'monospace'],
            },
            borderRadius: {
                lg: '8px',
                xl: '12px',
                '2xl': '16px',
            },
            boxShadow: {
                // Legacy
                soft: '0 20px 45px -25px rgba(13, 148, 136, 0.45)',
                // Design-system tokens
                card: '0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06)',
                pop: '0 4px 12px rgba(0,0,0,0.08)',
                modal: '0 20px 40px rgba(0,0,0,0.16)',
            },
            keyframes: {
                'slide-up': {
                    '0%': { opacity: '0', transform: 'translate(-50%, 1rem)' },
                    '100%': { opacity: '1', transform: 'translate(-50%, 0)' },
                },
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
                'sheet-up': {
                    '0%': { opacity: '0', transform: 'translateY(100%)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'sheet-down': {
                    '0%': { opacity: '1', transform: 'translateY(0)' },
                    '100%': { opacity: '0', transform: 'translateY(100%)' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'fade-out': {
                    '0%': { opacity: '1' },
                    '100%': { opacity: '0' },
                },
                'zoom-in': {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                'zoom-out': {
                    '0%': { opacity: '1', transform: 'scale(1)' },
                    '100%': { opacity: '0', transform: 'scale(0.95)' },
                },
            },
            animation: {
                'slide-up': 'slide-up 0.25s ease-out',
                shimmer: 'shimmer 1.5s infinite',
                'sheet-up': 'sheet-up 0.3s ease-out',
                'sheet-down': 'sheet-down 0.25s ease-in',
                'fade-in': 'fade-in 0.2s ease-out',
                'fade-out': 'fade-out 0.15s ease-in',
                'zoom-in': 'zoom-in 0.2s ease-out',
                'zoom-out': 'zoom-out 0.15s ease-in',
            },
        },
    },
    plugins: [],
};

export default config;
