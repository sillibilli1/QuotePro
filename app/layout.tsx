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
    metadataBase: new URL('https://www.quoteproapp.com'),
    title: 'QuotePro - Professional Quotes & Invoices in Seconds',
    description: 'Stop juggling Excel and messy receipts. QuotePro is the ultimate AI-powered quote and invoice generator for modern contractors. Create, track, and get paid faster.',
    keywords: 'quote generator, invoice software, contractor CRM, AI quotes, UAE invoicing, estimate builder, automated billing',
    openGraph: {
        type: 'website',
        url: 'https://www.quoteproapp.com',
        title: 'QuotePro - Professional Quotes & Invoices in Seconds',
        description: 'Stop juggling Excel and messy receipts. QuotePro is the ultimate AI-powered quote and invoice generator for modern contractors. Create, track, and get paid faster.',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'QuotePro - Professional Quotes & Invoices in Seconds',
        description: 'Stop juggling Excel and messy receipts. QuotePro is the ultimate AI-powered quote and invoice generator for modern contractors. Create, track, and get paid faster.',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
};

export const themeColor = '#000000';

export default function RootLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <html lang="en" className={`${inter.variable} scroll-smooth`}>
            <body className="font-sans">
                <ScrollRevealInit />
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}
