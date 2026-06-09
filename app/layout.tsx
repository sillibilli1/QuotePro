import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { ScrollRevealInit } from '@/components/landing/ScrollRevealInit';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'QuotePro',
    description: 'AI-powered quotation generator for UAE contractors.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <html lang="en" className={`${inter.variable} scroll-smooth`}>
            <head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, maximum-scale=1"
                />
            </head>
            <body className="font-sans">
                <ScrollRevealInit />
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}
