import { NextResponse } from 'next/server';
import type { GeneratedQuoteData, QuoteReviseResponse, QuoteReviseRequest } from '@/types';
import { generatedQuoteDataSchema } from '@/types';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

const AI_MODEL = 'gpt-5.4-mini';
const AI_TIMEOUT_MS = 15000;

function buildRevisionSystemPrompt(currencyCode: string): string {
    return `You are an expert quotation writer for small and medium businesses.
You specialize in: contracting, maintenance, interior design, logistics, and events.

Your quotes follow professional business standards:
- Include 5% VAT calculated correctly
- Use ${currencyCode} currency throughout — all monetary values must be realistic for the ${currencyCode} market
- Professional tone — formal but not robotic
- Line items include: description, unit, quantity, unit rate (${currencyCode}), subtotal (${currencyCode})
- Include standard terms: validity period (30 days), payment terms (50% advance on confirmation, 50% on project completion)
- Scope descriptions are specific, not vague — "Supply and install 4 units of 2-ton Daikin split AC systems" not "AC installation"

You are REVISING an existing quote. Apply the user's requested change and return the COMPLETE updated quote as a valid JSON object in the exact same schema. Recalculate all subtotals, the 5% VAT, and the total so they are internally consistent. Do not add commentary. Only output the JSON object.

Output format:
{
  "project_title": "string",
  "client_name": "string",
  "client_company": "string | null",
  "line_items": [
    {
      "item_number": number,
      "description": "string",
      "unit": "string",
      "quantity": number,
      "unit_rate_aed": number,
      "subtotal_aed": number
    }
  ],
  "subtotal_aed": number,
  "vat_5_percent_aed": number,
  "total_aed": number,
  "validity_days": 30,
  "payment_terms": "string",
  "estimated_duration": "string",
  "notes": "string | null"
}`;
}

function buildRevisionUserPrompt(
    currentQuoteData: GeneratedQuoteData,
    instruction: string,
    context: {
        project_type: string;
        brief_text: string;
        client_name: string;
        client_company: string | null;
        approx_value: number | null;
    },
    currencyCode: string
) {
    return `Current quote JSON:
${JSON.stringify(currentQuoteData, null, 2)}

Original project context:
Project Type: ${context.project_type}
Project Description: ${context.brief_text}
Client Name: ${context.client_name}
Client Company: ${context.client_company ?? 'Not provided'}
Approximate Value: ${context.approx_value ? `${context.approx_value} ${currencyCode}` : 'Not provided'}

User's requested change:
"${instruction}"

Apply this change to the quote and return the COMPLETE updated JSON. Recalculate all totals and ensure internal consistency.`;
}

async function callOpenAI(systemPrompt: string, userPrompt: string) {
    const apiKey = process.env.CUSTOM_AI_API_KEY;
    const baseURL = process.env.CUSTOM_AI_BASE_URL;

    if (!apiKey) {
        throw new Error('CUSTOM_AI_API_KEY is not configured.');
    }

    if (!baseURL) {
        throw new Error('CUSTOM_AI_BASE_URL is not configured.');
    }

    const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: baseURL,
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    try {
        const response = await openai.chat.completions.create(
            {
                model: AI_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt,
                    },
                    {
                        role: 'user',
                        content: userPrompt,
                    },
                ],
                response_format: { type: 'json_object' },
                temperature: 0.2,
                max_tokens: 2400,
            },
            {
                signal: controller.signal,
            }
        );

        const textContent = response.choices[0]?.message?.content?.trim();

        if (!textContent) {
            throw new Error('AI API response did not include text content.');
        }

        return textContent;
    } finally {
        clearTimeout(timeoutId);
    }
}

function sanitizeGeneratedQuoteData(data: GeneratedQuoteData): GeneratedQuoteData {
    return {
        ...data,
        project_title: data.project_title.trim(),
        client_name: data.client_name.trim(),
        client_company: data.client_company?.trim() ?? null,
        payment_terms: data.payment_terms.trim(),
        estimated_duration: data.estimated_duration.trim(),
        notes: data.notes?.trim() ?? null,
        line_items: data.line_items.map((item) => ({
            ...item,
            description: item.description.trim(),
            unit: item.unit.trim(),
        })),
    };
}

async function reviseQuote(
    currentQuoteData: GeneratedQuoteData,
    instruction: string,
    context: {
        project_type: string;
        brief_text: string;
        client_name: string;
        client_company: string | null;
        approx_value: number | null;
    },
    currencyCode: string
): Promise<GeneratedQuoteData | null> {
    const systemPrompt = buildRevisionSystemPrompt(currencyCode);
    const userPrompt = buildRevisionUserPrompt(currentQuoteData, instruction, context, currencyCode);

    for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
            const responseText = await callOpenAI(systemPrompt, userPrompt);
            const parsed = JSON.parse(responseText) as unknown;
            const validated = generatedQuoteDataSchema.parse(parsed);
            return sanitizeGeneratedQuoteData(validated);
        } catch (error) {
            if (attempt === 1) {
                console.error('Revision validation failed:', error);
                return null;
            }
        }
    }

    return null;
}

type ProfileCurrencyRow = { currency_code: string };

type ProfilesTable = {
    select: (columns: 'currency_code') => {
        eq: (column: 'id', value: string) => {
            maybeSingle: () => Promise<{ data: ProfileCurrencyRow | null; error: { message: string } | null }>;
        };
    };
};

export async function POST(request: Request) {
    const supabase = createClient();
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json<QuoteReviseResponse>(
            { success: false, error: 'unauthorized', message: 'Unauthorized.' },
            { status: 401 }
        );
    }

    // Fetch the user's currency preference
    const profilesTable = supabase.from('profiles') as unknown as ProfilesTable;
    const { data: profileData } = await profilesTable
        .select('currency_code')
        .eq('id', user.id)
        .maybeSingle();
    const currencyCode = profileData?.currency_code || 'AED';

    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json<QuoteReviseResponse>(
            { success: false, error: 'invalid_request', message: 'Invalid request body.' },
            { status: 400 }
        );
    }

    const payload = body as QuoteReviseRequest;

    if (!payload.quote_data || !payload.instruction || !payload.context) {
        return NextResponse.json<QuoteReviseResponse>(
            { success: false, error: 'invalid_request', message: 'Missing required fields.' },
            { status: 400 }
        );
    }

    if (typeof payload.instruction !== 'string' || payload.instruction.trim().length === 0) {
        return NextResponse.json<QuoteReviseResponse>(
            { success: false, error: 'invalid_instruction', message: 'Instruction cannot be empty.' },
            { status: 400 }
        );
    }

    try {
        const revisedQuoteData = await reviseQuote(
            payload.quote_data,
            payload.instruction.trim(),
            payload.context,
            currencyCode
        );

        if (!revisedQuoteData) {
            return NextResponse.json<QuoteReviseResponse>(
                {
                    success: false,
                    error: 'revision_failed',
                    message: "Couldn't apply that change. Try rephrasing.",
                },
                { status: 422 }
            );
        }

        return NextResponse.json<QuoteReviseResponse>({
            success: true,
            quote_data: revisedQuoteData,
        });
    } catch (error) {
        console.error('Quote revision failed:', error);
        return NextResponse.json<QuoteReviseResponse>(
            {
                success: false,
                error: 'revision_failed',
                message: 'Unable to revise quote. Please try again.',
            },
            { status: 500 }
        );
    }
}
