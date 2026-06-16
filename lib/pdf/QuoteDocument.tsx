import React from 'react';
import { Document, Page, StyleSheet, Text, View, Image } from '@react-pdf/renderer';
import { ARABIC_LABELS, registerPdfFonts } from '@/lib/pdf/fonts';
import type { QuoteLineItem } from '@/types';

registerPdfFonts();

type QuoteDocumentProps = {
    quoteNumber: string;
    createdAt: string;
    validUntil: string;
    companyName: string;
    companyAddress: string;
    companyPhone: string;
    companyLogoUrl?: string | null;
    clientName: string;
    clientCompany: string | null;
    projectTitle: string;
    pdfMode: 'bilingual' | 'english_only';
    lineItems: QuoteLineItem[];
    subtotal: number;
    vat: number;
    total: number;
    estimatedDuration: string;
    currencyCode: string;
    taxRate: number;
    isSubscribed: boolean;
};

function formatCurrency(value: number, currencyCode: string) {
    return `${currencyCode} ${value.toFixed(2)}`;
}

const styles = StyleSheet.create({
    page: {
        padding: 32,
        fontSize: 10,
        fontFamily: 'Helvetica',
        color: '#0f172a',
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#cbd5e1',
        paddingBottom: 16,
        marginBottom: 16,
    },
    companyBlock: {
        width: '56%',
        gap: 4,
        alignItems: 'flex-start',
    },
    companyLogo: {
        maxHeight: 80,
        maxWidth: 220,
        objectFit: 'contain',
        marginBottom: 8,
    },
    companyName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    companyMeta: {
        fontSize: 10,
        color: '#4B5563',
        lineHeight: 1.4,
    },
    phoneLabel: {
        fontSize: 10,
        color: '#4B5563',
        marginTop: 8,
    },
    projectTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
        marginTop: 16,
        lineHeight: 1.4,
    },
    quotationBlock: {
        width: '40%',
        alignItems: 'flex-end',
        gap: 4,
    },
    quotationTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0f766e',
    },
    arabicTitle: {
        fontFamily: 'Cairo',
        fontSize: 13,
        color: '#334155',
    },
    subHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#f8fafc',
        borderRadius: 8,
    },
    subHeaderItem: {
        width: '32%',
        gap: 3,
    },
    label: {
        fontSize: 9,
        color: '#64748b',
        textTransform: 'uppercase',
    },
    value: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    arabicLabel: {
        fontFamily: 'Cairo',
        fontSize: 9,
        color: '#64748b',
    },
    clientBox: {
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        padding: 12,
        gap: 4,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    table: {
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#e2e8f0',
        paddingVertical: 8,
        paddingHorizontal: 6,
        fontWeight: 'bold',
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
        paddingVertical: 8,
        paddingHorizontal: 6,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    tableRowAlt: {
        backgroundColor: '#f8fafc',
    },
    tableCell: {
        justifyContent: 'flex-start',
        paddingHorizontal: 4,
        paddingVertical: 2,
    },
    colNumber: { width: '6%' },
    colDescription: {
        width: '34%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingRight: 8,
    },
    colUnit: { width: '12%' },
    colQty: { width: '10%', textAlign: 'right' },
    colRate: { width: '18%', textAlign: 'right' },
    colSubtotal: { width: '20%', textAlign: 'right' },
    totalsWrapper: {
        marginLeft: 'auto',
        width: '44%',
        gap: 6,
        marginBottom: 18,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 8,
    },
    bilingualLabel: {
        flexDirection: 'column',
        gap: 2,
        flex: 1,
    },
    totalHighlight: {
        backgroundColor: '#0f766e',
        borderColor: '#0f766e',
    },
    totalHighlightText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    termsBox: {
        borderTopWidth: 1,
        borderTopColor: '#cbd5e1',
        paddingTop: 12,
        gap: 6,
    },
    termRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    watermark: {
        marginTop: 22,
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: 9,
    },
});

export function QuoteDocument({
    quoteNumber,
    createdAt,
    validUntil,
    companyName,
    companyAddress,
    companyPhone,
    companyLogoUrl,
    clientName,
    clientCompany,
    projectTitle,
    pdfMode,
    lineItems,
    subtotal,
    vat,
    total,
    estimatedDuration,
    currencyCode,
    taxRate,
    isSubscribed,
}: QuoteDocumentProps) {
    const showArabic = pdfMode !== 'english_only';
    console.log("👉 [REACT-PDF] Prop pdfMode received:", pdfMode, "Calculated showArabic:", showArabic);
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View style={styles.companyBlock}>
                        {companyLogoUrl ? (
                            <Image src={companyLogoUrl} style={styles.companyLogo} />
                        ) : (
                            <Text style={styles.companyName}>{companyName}</Text>
                        )}
                        {!isSubscribed && <Text style={styles.companyMeta}>{companyAddress}</Text>}
                        <Text style={styles.phoneLabel}>Phone: {companyPhone}</Text>
                        <Text style={styles.projectTitle}>{projectTitle}</Text>
                    </View>

                    <View style={styles.quotationBlock}>
                        <Text style={styles.quotationTitle}>QUOTATION</Text>
                        {showArabic && <Text style={styles.arabicTitle}>{ARABIC_LABELS.quotation}</Text>}
                    </View>
                </View>

                <View style={styles.subHeader}>
                    <View style={styles.subHeaderItem}>
                        <Text style={styles.label}>Quote #</Text>
                        <Text style={styles.value}>{quoteNumber}</Text>
                    </View>
                    <View style={styles.subHeaderItem}>
                        <Text style={styles.label}>Date</Text>
                        <Text style={styles.value}>{createdAt}</Text>
                    </View>
                    <View style={styles.subHeaderItem}>
                        <Text style={styles.label}>Valid Until</Text>
                        <Text style={styles.value}>{validUntil}</Text>
                    </View>
                </View>

                <View style={styles.clientBox}>
                    <Text style={styles.sectionTitle}>Client Information</Text>
                    <Text>{`To: ${clientName}`}</Text>
                    <Text>{`Company: ${clientCompany ?? '-'}`}</Text>
                </View>

                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.colNumber, styles.tableCell]}>#</Text>
                        <Text style={[styles.colDescription, styles.tableCell]}>Description</Text>
                        <Text style={[styles.colUnit, styles.tableCell]}>Unit</Text>
                        <Text style={[styles.colQty, styles.tableCell]}>Qty</Text>
                        <Text style={[styles.colRate, styles.tableCell]}>{`Unit Rate (${currencyCode})`}</Text>
                        <Text style={[styles.colSubtotal, styles.tableCell]}>{`Subtotal (${currencyCode})`}</Text>
                    </View>

                    {lineItems.map((item, index) => (
                        <View
                            key={`${item.item_number}-${index}`}
                            style={index % 2 === 1 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow}
                            wrap={false}
                        >
                            <Text style={[styles.colNumber, styles.tableCell]}>{item.item_number}</Text>
                            <Text style={[styles.colDescription, styles.tableCell]}>{item.description}</Text>
                            <Text style={[styles.colUnit, styles.tableCell]}>{item.unit}</Text>
                            <Text style={[styles.colQty, styles.tableCell]}>{item.quantity.toFixed(2)}</Text>
                            <Text style={[styles.colRate, styles.tableCell]}>{formatCurrency(item.unit_rate_aed, currencyCode)}</Text>
                            <Text style={[styles.colSubtotal, styles.tableCell]}>{formatCurrency(item.subtotal_aed, currencyCode)}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.totalsWrapper}>
                    <View style={styles.totalRow}>
                        {showArabic ? (
                            <View style={styles.bilingualLabel}>
                                <Text>Subtotal</Text>
                                <Text style={styles.arabicLabel}>{ARABIC_LABELS.subtotal}</Text>
                            </View>
                        ) : (
                            <Text>Subtotal</Text>
                        )}
                        <Text>{formatCurrency(subtotal, currencyCode)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        {showArabic ? (
                            <View style={styles.bilingualLabel}>
                                <Text>{taxRate > 0 ? `VAT/Tax ${taxRate}%` : 'Tax'}</Text>
                                <Text style={styles.arabicLabel}>{ARABIC_LABELS.vat}</Text>
                            </View>
                        ) : (
                            <Text>{taxRate > 0 ? `VAT/Tax ${taxRate}%` : 'Tax'}</Text>
                        )}
                        <Text>{formatCurrency(vat, currencyCode)}</Text>
                    </View>
                    <View style={[styles.totalRow, styles.totalHighlight]}>
                        {showArabic ? (
                            <View style={styles.bilingualLabel}>
                                <Text style={styles.totalHighlightText}>TOTAL</Text>
                                <Text style={[styles.arabicLabel, styles.totalHighlightText]}>{ARABIC_LABELS.total}</Text>
                            </View>
                        ) : (
                            <Text style={styles.totalHighlightText}>TOTAL</Text>
                        )}
                        <Text style={styles.totalHighlightText}>{formatCurrency(total, currencyCode)}</Text>
                    </View>
                </View>

                <View style={styles.termsBox}>
                    <Text style={styles.sectionTitle}>Terms</Text>
                    <View style={styles.termRow}>
                        <View>
                            <Text>Payment Terms: 50% advance on confirmation, 50% on project completion</Text>
                            {showArabic && <Text style={styles.arabicLabel}>{ARABIC_LABELS.paymentTerms}</Text>}
                        </View>
                    </View>
                    <View style={styles.termRow}>
                        <View>
                            <Text>{`Estimated Duration: ${estimatedDuration}`}</Text>
                            {showArabic && <Text style={styles.arabicLabel}>{ARABIC_LABELS.estimatedDuration}</Text>}
                        </View>
                    </View>
                </View>

                {!isSubscribed && <Text style={styles.watermark}>Generated with QuotePro</Text>}
            </Page>
        </Document>
    );
}
