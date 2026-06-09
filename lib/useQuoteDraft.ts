import { useReducer, useEffect, useCallback } from 'react';
import type { GeneratedQuoteData, QuoteDraft, QuoteDraftContext, RevisionEntry } from '@/types';

const STORAGE_KEY = 'qp_quote_draft';
const MAX_REVISIONS = 10;

type DraftState = QuoteDraft;

type DraftAction =
    | { type: 'START_GENERATE' }
    | { type: 'GENERATE_SUCCESS'; quote_data: GeneratedQuoteData; context: QuoteDraftContext }
    | { type: 'GENERATE_FAILED'; error: string }
    | { type: 'START_REVISE'; instruction: string }
    | { type: 'REVISE_SUCCESS'; quote_data: GeneratedQuoteData }
    | { type: 'REVISE_FAILED'; message: string }
    | { type: 'START_CONFIRM' }
    | { type: 'CONFIRM_FAILED'; message: string }
    | { type: 'RESET' }
    | { type: 'HYDRATE'; draft: QuoteDraft };

function draftReducer(state: DraftState, action: DraftAction): DraftState {
    switch (action.type) {
        case 'START_GENERATE':
            return {
                ...state,
                state: 'generating',
                error_message: null,
            };

        case 'GENERATE_SUCCESS':
            return {
                quote_data: action.quote_data,
                context: action.context,
                revisions: [],
                state: 'preview',
                error_message: null,
            };

        case 'GENERATE_FAILED':
            return {
                ...state,
                state: 'error',
                error_message: action.error,
            };

        case 'START_REVISE':
            return {
                ...state,
                state: 'revising',
                error_message: null,
                revisions: [
                    ...state.revisions,
                    {
                        instruction: action.instruction,
                        at: new Date().toISOString(),
                    },
                ],
            };

        case 'REVISE_SUCCESS':
            return {
                ...state,
                quote_data: action.quote_data,
                state: 'preview',
                error_message: null,
            };

        case 'REVISE_FAILED':
            // Remove the last revision entry that failed
            return {
                ...state,
                state: 'preview',
                error_message: action.message,
                revisions: state.revisions.slice(0, -1),
            };

        case 'START_CONFIRM':
            return {
                ...state,
                state: 'saving',
                error_message: null,
            };

        case 'CONFIRM_FAILED':
            return {
                ...state,
                state: 'preview',
                error_message: action.message,
            };

        case 'RESET':
            return {
                quote_data: null,
                context: null,
                revisions: [],
                state: 'form',
                error_message: null,
            };

        case 'HYDRATE':
            return action.draft;

        default:
            return state;
    }
}

const initialState: DraftState = {
    quote_data: null,
    context: null,
    revisions: [],
    state: 'form',
    error_message: null,
};

export function useQuoteDraft() {
    const [draft, dispatch] = useReducer(draftReducer, initialState);

    // Hydrate from sessionStorage on mount
    useEffect(() => {
        try {
            const stored = sessionStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as QuoteDraft;
                dispatch({ type: 'HYDRATE', draft: parsed });
            }
        } catch (error) {
            console.error('Failed to hydrate draft from sessionStorage:', error);
        }
    }, []);

    // Persist to sessionStorage whenever draft changes
    useEffect(() => {
        if (draft.state !== 'form') {
            try {
                sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
            } catch (error) {
                console.error('Failed to persist draft to sessionStorage:', error);
            }
        }
    }, [draft]);

    const clearDraft = useCallback(() => {
        try {
            sessionStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Failed to clear draft from sessionStorage:', error);
        }
    }, []);

    const startGenerate = useCallback(() => {
        dispatch({ type: 'START_GENERATE' });
    }, []);

    const generateSuccess = useCallback((quote_data: GeneratedQuoteData, context: QuoteDraftContext) => {
        dispatch({ type: 'GENERATE_SUCCESS', quote_data, context });
    }, []);

    const generateFailed = useCallback((error: string) => {
        dispatch({ type: 'GENERATE_FAILED', error });
    }, []);

    const startRevise = useCallback((instruction: string) => {
        dispatch({ type: 'START_REVISE', instruction });
    }, []);

    const reviseSuccess = useCallback((quote_data: GeneratedQuoteData) => {
        dispatch({ type: 'REVISE_SUCCESS', quote_data });
    }, []);

    const reviseFailed = useCallback((message: string) => {
        dispatch({ type: 'REVISE_FAILED', message });
    }, []);

    const startConfirm = useCallback(() => {
        dispatch({ type: 'START_CONFIRM' });
    }, []);

    const confirmFailed = useCallback((message: string) => {
        dispatch({ type: 'CONFIRM_FAILED', message });
    }, []);

    const reset = useCallback(() => {
        clearDraft();
        dispatch({ type: 'RESET' });
    }, [clearDraft]);

    const revisionsRemaining = MAX_REVISIONS - draft.revisions.length;

    return {
        draft,
        actions: {
            startGenerate,
            generateSuccess,
            generateFailed,
            startRevise,
            reviseSuccess,
            reviseFailed,
            startConfirm,
            confirmFailed,
            reset,
            clearDraft,
        },
        revisionsRemaining,
        maxRevisions: MAX_REVISIONS,
    };
}
