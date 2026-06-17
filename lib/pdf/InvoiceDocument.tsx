import React from 'react';
import { Document, Page, StyleSheet, Text, View, Image } from '@react-pdf/renderer';
import { registerPdfFonts, ARABIC_LABELS } from '@/lib/pdf/fonts';
import type { QuoteLineItem } from '@/types';

registerPdfFonts();

type BankDetails = {
    bank_name: string;
    account_name: string;
    account_number: string;
    iban?: string | null;
    swift_code?: string | null;
    branch?: string | null;
    currency: string;
};

type InvoiceDocumentProps = {
    invoiceNumber: string;
    createdAt: string;
    dueDate: string;
    companyName: string;
    companyAddress: string;
    companyPhone: string;
    companyLogoUrl?: string | null;
    companyTrn?: string | null;
    clientName: string;
    clientCompany: string | null;
    projectTitle: string;
    pdfMode: 'bilingual' | 'english_only';
    lineItems: QuoteLineItem[];
    subtotal: number;
    vat: number;
    total: number;
    currencyCode: string;
    taxRate: number;
    isSubscribed: boolean;
    bankDetails: BankDetails | null;
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
    trnRow: {
        flexDirection: 'row',
        marginTop: 8,
        padding: 6,
        backgroundColor: '#f0fdf4',
        borderRadius: 4,
        borderLeftWidth: 3,
        borderLeftColor: '#10b981',
    },
    trnLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#065f46',
        marginRight: 8,
    },
    trnValue: {
        fontSize: 10,
        color: '#064e3b',
        fontFamily: 'Courier',
    },
    projectTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
        marginTop: 16,
        lineHeight: 1.4,
    },
    invoiceBlock: {
        width: '40%',
        alignItems: 'flex-end',
        gap: 4,
    },
    headerBanner: {
        backgroundColor: '#065f46',
        padding: 16,
        marginBottom: 20,
        borderRadius: 8,
    },
    taxInvoiceLabel: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
        letterSpacing: 2,
    },
    taxInvoiceLabelAr: {
        fontSize: 20,
        color: '#ffffff',
        textAlign: 'center',
        marginTop: 4,
        fontFamily: 'Cairo',
    },
    invoiceDetailsBox: {
        backgroundColor: '#f9fafb',
        padding: 12,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    detailLabel: {
        fontSize: 10,
        color: '#6b7280',
        fontWeight: 'bold',
    },
    detailValue: {
        fontSize: 10,
        color: '#111827',
        fontFamily: 'Courier',
    },
    detailValueHighlight: {
        fontSize: 10,
        color: '#dc2626',
        fontWeight: 'bold',
        fontFamily: 'Courier',
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
    paymentSection: {
        marginTop: 40,
        padding: 20,
        backgroundColor: '#f0fdf4',
        borderTopWidth: 3,
        borderTopColor: '#10b981',
        borderRadius: 8,
    },
    paymentHeader: {
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#10b981',
        paddingBottom: 8,
    },
    paymentTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#065f46',
        letterSpacing: 1,
    },
    bankDetailsGrid: {
        marginBottom: 20,
    },
    bankDetailRow: {
        flexDirection: 'row',
        marginBottom: 8,
        paddingVertical: 4,
    },
    bankLabel: {
        fontSize: 10,
        color: '#064e3b',
        fontWeight: 'bold',
        width: 120,
        paddingRight: 8,
    },
    bankValue: {
        fontSize: 10,
        color: '#1f2937',
        flex: 1,
    },
    bankValueMono: {
        fontSize: 10,
        color: '#1f2937',
        fontFamily: 'Courier',
        flex: 1,
        letterSpacing: 0.5,
    },
    paymentInstructions: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#ffffff',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#d1fae5',
    },
    instructionsTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#065f46',
        marginBottom: 8,
    },
    instructionsText: {
        fontSize: 9,
        color: '#374151',
        marginBottom: 4,
        lineHeight: 1.4,
    },
    footer: {
        marginTop: 30,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    footerText: {
        fontSize: 8,
        color: '#9ca3af',
        textAlign: 'center',
        marginBottom: 4,
    },
    watermark: {
        marginTop: 22,
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: 9,
    },
});

export function InvoiceDocument({
    invoiceNumber,
    createdAt,
    dueDate,
    companyName,
    companyAddress,
    companyPhone,
    companyLogoUrl,
    companyTrn,
    clientName,
    clientCompany,
    projectTitle,
    pdfMode,
    lineItems,
    subtotal,
    vat,
    total,
    currencyCode,
    taxRate,
    isSubscribed,
    bankDetails,
}: InvoiceDocumentProps) {
    // Top-level sanitization to prevent textkit.js crashes
    const showArabic = pdfMode !== 'english_only';

    // Sanitize bank details (handle stringified JSON from Supabase)
    const safeBankDetails = typeof bankDetails === 'string' ? JSON.parse(bankDetails) : (bankDetails || null);
    const safeSwiftCode = safeBankDetails?.swift_code ? String(safeBankDetails.swift_code).trim() : null;
    const safeIban = safeBankDetails?.iban ? String(safeBankDetails.iban).trim() : null;
    const safeBranch = safeBankDetails?.branch ? String(safeBankDetails.branch).trim() : null;
    const safeBankName = safeBankDetails?.bank_name ? String(safeBankDetails.bank_name).trim() : '';
    const safeAccountName = safeBankDetails?.account_name ? String(safeBankDetails.account_name).trim() : '';
    const safeAccountNumber = safeBankDetails?.account_number ? String(safeBankDetails.account_number).trim() : '';
    const safeBankCurrency = safeBankDetails?.currency ? String(safeBankDetails.currency).trim() : '';

    // Sanitize all string fields
    const safeInvoiceNumber = invoiceNumber ? String(invoiceNumber).trim() : '';
    const safeCreatedAt = createdAt ? String(createdAt).trim() : '';
    const safeDueDate = dueDate ? String(dueDate).trim() : '';
    const safeCompanyName = companyName ? String(companyName).trim() : '';
    const safeCompanyAddress = companyAddress ? String(companyAddress).trim() : '';
    const safeCompanyPhone = companyPhone ? String(companyPhone).trim() : '';
    const safeCompanyLogoUrl = companyLogoUrl ? String(companyLogoUrl).trim() : null;
    const safeCompanyTrn = companyTrn ? String(companyTrn).trim() : null;
    const safeClientName = clientName ? String(clientName).trim() : '';
    const safeClientCompany = clientCompany ? String(clientCompany).trim() : null;
    const safeProjectTitle = projectTitle ? String(projectTitle).trim() : '';
    const safeCurrencyCode = currencyCode ? String(currencyCode).trim() : 'AED';

    // Sanitize line items (filter out null/undefined)
    const safeLineItems = (lineItems || []).filter(item => item && typeof item === 'object').map(item => ({
        item_number: item.item_number ? String(item.item_number).trim() : '',
        description: item.description ? String(item.description).trim() : '',
        unit: item.unit ? String(item.unit).trim() : '',
        quantity: typeof item.quantity === 'number' ? item.quantity : 0,
        unit_rate_aed: typeof item.unit_rate_aed === 'number' ? item.unit_rate_aed : 0,
        subtotal_aed: typeof item.subtotal_aed === 'number' ? item.subtotal_aed : 0,
    }));

    // Sanitize numbers
    const safeSubtotal = typeof subtotal === 'number' ? subtotal : 0;
    const safeVat = typeof vat === 'number' ? vat : 0;
    const safeTotal = typeof total === 'number' ? total : 0;
    const safeTaxRate = typeof taxRate === 'number' ? taxRate : 0;
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.headerBanner}>
                    <Text style={styles.taxInvoiceLabel}>TAX INVOICE</Text>
                    {showArabic ? <Text style={styles.taxInvoiceLabelAr}>فاتورة ضريبية</Text> : null}
                </View>

                <View style={styles.header}>
                    <View style={styles.companyBlock}>
                        {safeCompanyLogoUrl ? (
                            <Image src={safeCompanyLogoUrl} style={styles.companyLogo} />
                        ) : (
                            <Text style={styles.companyName}>{safeCompanyName}</Text>
                        )}
                        {isSubscribed === false ? <Text style={styles.companyMeta}>{safeCompanyAddress}</Text> : null}
                        <Text style={styles.phoneLabel}>Phone: {safeCompanyPhone}</Text>
                        {safeCompanyTrn ? (
                            <View style={styles.trnRow}>
                                <Text style={styles.trnLabel}>TRN:</Text>
                                <Text style={styles.trnValue}>{safeCompanyTrn}</Text>
                            </View>
                        ) : null}
                        <Text style={styles.projectTitle}>{safeProjectTitle}</Text>
                    </View>
                </View>

                <View style={styles.invoiceDetailsBox}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Invoice Number:</Text>
                        <Text style={styles.detailValue}>{safeInvoiceNumber}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Invoice Date:</Text>
                        <Text style={styles.detailValue}>{safeCreatedAt}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Due Date:</Text>
                        <Text style={styles.detailValueHighlight}>{safeDueDate}</Text>
                    </View>
                </View>

                <View style={styles.clientBox}>
                    <Text style={styles.sectionTitle}>Bill To</Text>
                    <Text>{safeClientName}</Text>
                    {safeClientCompany ? <Text>{safeClientCompany}</Text> : null}
                </View>

                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.colNumber, styles.tableCell]}>#</Text>
                        <Text style={[styles.colDescription, styles.tableCell]}>Description</Text>
                        <Text style={[styles.colUnit, styles.tableCell]}>Unit</Text>
                        <Text style={[styles.colQty, styles.tableCell]}>Qty</Text>
                        <Text style={[styles.colRate, styles.tableCell]}>{`Unit Rate (${safeCurrencyCode})`}</Text>
                        <Text style={[styles.colSubtotal, styles.tableCell]}>{`Subtotal (${safeCurrencyCode})`}</Text>
                    </View>

                    {safeLineItems.map((item, index) => (
                        <View
                            key={`${item.item_number}-${index}`}
                            style={index % 2 === 1 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow}
                            wrap={false}
                        >
                            <Text style={[styles.colNumber, styles.tableCell]}>{item.item_number}</Text>
                            <Text style={[styles.colDescription, styles.tableCell]}>{item.description}</Text>
                            <Text style={[styles.colUnit, styles.tableCell]}>{item.unit}</Text>
                            <Text style={[styles.colQty, styles.tableCell]}>{item.quantity.toFixed(2)}</Text>
                            <Text style={[styles.colRate, styles.tableCell]}>{formatCurrency(item.unit_rate_aed, safeCurrencyCode)}</Text>
                            <Text style={[styles.colSubtotal, styles.tableCell]}>{formatCurrency(item.subtotal_aed, safeCurrencyCode)}</Text>
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
                        <Text>{formatCurrency(safeSubtotal, safeCurrencyCode)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        {showArabic ? (
                            <View style={styles.bilingualLabel}>
                                <Text>{safeTaxRate > 0 ? `VAT/Tax ${safeTaxRate}%` : 'Tax'}</Text>
                                <Text style={styles.arabicLabel}>{ARABIC_LABELS.vat}</Text>
                            </View>
                        ) : (
                            <Text>{safeTaxRate > 0 ? `VAT/Tax ${safeTaxRate}%` : 'Tax'}</Text>
                        )}
                        <Text>{formatCurrency(safeVat, safeCurrencyCode)}</Text>
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
                        <Text style={styles.totalHighlightText}>{formatCurrency(safeTotal, safeCurrencyCode)}</Text>
                    </View>
                </View>

                {safeBankDetails && (
                    <View style={styles.paymentSection}>
                        <View style={styles.paymentHeader}>
                            <Text style={styles.paymentTitle}>Payment Information</Text>
                        </View>

                        <View style={styles.bankDetailsGrid}>
                            <View style={styles.bankDetailRow}>
                                <Text style={styles.bankLabel}>Bank Name:</Text>
                                <Text style={styles.bankValue}>{safeBankName}</Text>
                            </View>
                            <View style={styles.bankDetailRow}>
                                <Text style={styles.bankLabel}>Account Name:</Text>
                                <Text style={styles.bankValue}>{safeAccountName}</Text>
                            </View>
                            <View style={styles.bankDetailRow}>
                                <Text style={styles.bankLabel}>Account Number:</Text>
                                <Text style={styles.bankValueMono}>{safeAccountNumber}</Text>
                            </View>
                            {safeIban ? (
                                <View style={styles.bankDetailRow}>
                                    <Text style={styles.bankLabel}>IBAN:</Text>
                                    <Text style={styles.bankValueMono}>{safeIban}</Text>
                                </View>
                            ) : null}
                            {safeSwiftCode ? (
                                <View style={styles.bankDetailRow}>
                                    <Text style={styles.bankLabel}>Swift Code:</Text>
                                    <Text style={styles.bankValueMono}>{safeSwiftCode}</Text>
                                </View>
                            ) : null}
                            {safeBranch ? (
                                <View style={styles.bankDetailRow}>
                                    <Text style={styles.bankLabel}>Branch:</Text>
                                    <Text style={styles.bankValue}>{safeBranch}</Text>
                                </View>
                            ) : null}
                            <View style={styles.bankDetailRow}>
                                <Text style={styles.bankLabel}>Currency:</Text>
                                <Text style={styles.bankValue}>{safeBankCurrency}</Text>
                            </View>
                        </View>

                        <View style={styles.paymentInstructions}>
                            <Text style={styles.instructionsTitle}>Payment Terms:</Text>
                            <Text style={styles.instructionsText}>• Payment due within 30 days from invoice date</Text>
                            <Text style={styles.instructionsText}>• Please include invoice number in payment reference</Text>
                            <Text style={styles.instructionsText}>• Bank transfer is the preferred payment method</Text>
                        </View>
                    </View>
                )}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        This is a computer-generated invoice and does not require a signature.
                    </Text>
                    <Text style={styles.footerText}>
                        For queries, please contact {safeCompanyName} at {safeCompanyPhone}
                    </Text>
                </View>

                {isSubscribed === false ? <Text style={styles.watermark}>Generated with QuotePro</Text> : null}
            </Page>
        </Document>
    );
}
