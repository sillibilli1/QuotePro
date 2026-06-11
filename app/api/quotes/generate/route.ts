import { NextResponse } from 'next/server';
import type { GeneratedQuoteData, QuoteGenerateErrorResponse, QuoteGenerateResponse } from '@/types';
import { generatedQuoteDataSchema, quoteGenerateRequestSchema } from '@/types';
import { getMonthlyQuoteUsage, getQuoteCreationLimit } from '@/lib/quote-usage';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

const AI_MODEL = 'gpt-5.4-mini';
const AI_TIMEOUT_MS = 15000;
const GENERIC_ERROR_MESSAGE = 'Unable to generate quote. Please try again or contact support.';

type ProfileCurrencyRow = { currency_code: string; plan: string | null; is_subscribed: boolean };

type ProfilesTable = {
    select: (columns: string) => {
        eq: (column: 'id', value: string) => {
            maybeSingle: () => Promise<{ data: ProfileCurrencyRow | null; error: { message: string } | null }>;
        };
    };
};

function buildSystemPrompt(currencyCode: string, taxRate: number): string {
    return `You are an expert quotation writer for small and medium businesses.
You specialize in: contracting, maintenance, interior design, logistics, and events.

Your quotes follow professional business standards:
- Include ${taxRate}% tax/VAT calculated correctly
- Use ${currencyCode} currency throughout — all monetary values must be realistic for the ${currencyCode} market
- Professional tone — formal but not robotic
- Line items include: description, unit, quantity, unit rate (${currencyCode}), subtotal (${currencyCode})
- Include standard terms: validity period (30 days), payment terms (50% advance on confirmation, 50% on project completion)
- Scope descriptions are specific, not vague — "Supply and install 4 units of 2-ton Daikin split AC systems" not "AC installation"

CRITICAL: All monetary field names use "_aed" suffix but represent ${currencyCode}. Calculate tax at exactly ${taxRate}%.

When you receive project details, you MUST output a valid JSON object.
Do not include any explanatory text. Only the JSON object.

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
      "unit_rate_aed": number (in ${currencyCode}),
      "subtotal_aed": number (in ${currencyCode})
    }
  ],
  "subtotal_aed": number (in ${currencyCode}),
  "vat_5_percent_aed": number (${taxRate}% tax in ${currencyCode}),
  "total_aed": number (in ${currencyCode}),
  "validity_days": 30,
  "payment_terms": "string",
  "estimated_duration": "string",
  "notes": "string | null"
}`;
}

function buildUserPrompt(input: {
    project_type: string;
    brief_text: string;
    client_name: string;
    client_company: string | null;
    approximate_value_aed: number | null;
    currencyCode: string;
}) {
    const approxValue = input.approximate_value_aed
        ? `${input.approximate_value_aed} ${input.currencyCode}`
        : 'Not provided';

    return `Generate a professional quotation with the following details:

Project Type: ${input.project_type}
Project Description: ${input.brief_text}
Client Name: ${input.client_name}
Client Company: ${input.client_company ?? 'Not provided'}
Approximate Value (if provided): ${approxValue}

Use ${input.currencyCode} currency with realistic local market rates for the ${input.currencyCode} region. If approximate value is provided, use it as a guide for pricing. Generate the line items for this quote with accurate, specific scope descriptions.`;
}

function jsonError(status: number, error: string, field?: QuoteGenerateErrorResponse['field']) {
    return NextResponse.json<QuoteGenerateResponse>(
        {
            success: false,
            error,
            field,
        },
        { status },
    );
}

function sanitizeGeneratedQuoteData(data: GeneratedQuoteData, requestedClientName: string, requestedClientCompany: string | null) {
    return {
        ...data,
        project_title: data.project_title.trim(),
        client_name: requestedClientName,
        client_company: requestedClientCompany,
        payment_terms: data.payment_terms.trim(),
        estimated_duration: data.estimated_duration.trim(),
        notes: data.notes?.trim() ?? null,
        line_items: data.line_items.map((item) => ({
            ...item,
            description: item.description.trim(),
            unit: item.unit.trim(),
        })),
    } satisfies GeneratedQuoteData;
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

async function generateStructuredQuote(input: {
    project_type: string;
    brief_text: string;
    client_name: string;
    client_company: string | null;
    approximate_value_aed: number | null;
    currencyCode: string;
    taxRate: number;
}) {
    const systemPrompt = buildSystemPrompt(input.currencyCode, input.taxRate);
    const userPrompt = buildUserPrompt(input);

    for (let attempt = 0; attempt < 2; attempt += 1) {
        const responseText = await callOpenAI(systemPrompt, userPrompt);

        try {
            const parsed = JSON.parse(responseText) as unknown;
            const validated = generatedQuoteDataSchema.parse(parsed);
            return sanitizeGeneratedQuoteData(validated, input.client_name, input.client_company);
        } catch {
            if (attempt === 1) {
                return null;
            }
        }
    }

    return null;
}

export async function POST(request: Request) {
    const supabase = createClient();
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return jsonError(401, 'Unauthorized', 'form');
    }

    // Fetch the user's currency preference from their profile
    const profilesTable = supabase.from('profiles') as unknown as ProfilesTable;
    const { data: profileData } = await profilesTable
        .select('currency_code, plan, is_subscribed')
        .eq('id', user.id)
        .maybeSingle();
    const currencyCode = profileData?.currency_code || 'AED';
    const isSubscribed = profileData?.is_subscribed ?? false;
    const plan = profileData?.plan ?? null;

    try {
        const usage = await getMonthlyQuoteUsage(user.id, isSubscribed, plan);
        const creationLimit = getQuoteCreationLimit(isSubscribed, plan);

        if (usage.count >= creationLimit) {
            const message =
                plan === 'growth'
                    ? 'You have reached the Fair Use limit for this month.'
                    : "You've reached your monthly limit of 5 quotes. Upgrade to Starter for unlimited quotes.";

            return NextResponse.json(
                {
                    error: 'limit_reached',
                    message,
                    upgrade_url: '/app/upgrade',
                },
                { status: 403 },
            );
        }
    } catch (error) {
        console.error('Usage check failed:', error);
        return jsonError(500, GENERIC_ERROR_MESSAGE, 'form');
    }

    let requestBody: unknown;

    try {
        requestBody = await request.json();
    } catch {
        return jsonError(400, 'Invalid request body.', 'form');
    }

    console.log("👉 [API PAYLOAD] Received pdf_mode:", (requestBody as any)?.pdf_mode);

    const parsedRequest = quoteGenerateRequestSchema.safeParse(requestBody);

    if (!parsedRequest.success) {
        const issue = parsedRequest.error.issues[0];
        const field = issue?.path[0];

        return jsonError(
            400,
            issue?.message ?? 'Invalid quote request.',
            typeof field === 'string' ? (field as QuoteGenerateErrorResponse['field']) : 'form',
        );
    }

    try {
        const quoteData = await generateStructuredQuote({
            ...parsedRequest.data,
            currencyCode: parsedRequest.data.currency,
            taxRate: parsedRequest.data.tax_rate,
        });

        if (!quoteData) {
            return jsonError(502, GENERIC_ERROR_MESSAGE, 'form');
        }

        // Day 8: Return only quote_data, no DB write
        return NextResponse.json<QuoteGenerateResponse>({
            success: true,
            quote_data: {
                ...quoteData,
                currency: parsedRequest.data.currency,
                tax_rate: parsedRequest.data.tax_rate,
            },
        });
    } catch (error) {
        console.error('Quote generation failed:', error);
        return jsonError(500, GENERIC_ERROR_MESSAGE, 'form');
    }
}
