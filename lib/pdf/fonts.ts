import { Font } from '@react-pdf/renderer';
import path from 'path';

let fontsRegistered = false;

export const ARABIC_LABELS = {
    quotation: 'عرض سعر',
    subtotal: 'المجموع الفرعي',
    vat: 'الضريبة 5%',
    total: 'الإجمالي',
    to: 'إلى',
    date: 'التاريخ',
    validUntil: 'صالح حتى',
    paymentTerms: 'شروط الدفع',
    validity: 'صالح لمدة 30 يوماً',
    estimatedDuration: 'المدة المقدرة',
} as const;

export function registerPdfFonts() {
    if (fontsRegistered) {
        return;
    }

    // Use path.join with process.cwd() to get the absolute path to the font file
    // This works in both development and production environments
    const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Cairo-VariableFont_slnt,wght.ttf');

    Font.register({
        family: 'Cairo',
        src: fontPath,
        fontWeight: 'normal',
    });

    Font.register({
        family: 'Cairo',
        src: fontPath,
        fontWeight: 'bold',
    });

    fontsRegistered = true;
}
