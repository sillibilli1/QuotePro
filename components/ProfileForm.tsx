'use client';

import { type FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ToastContainer, useToasts } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import type { Database, ProfileFormValues } from '@/types';
import { LogoUpload } from '@/components/LogoUpload';

type ProfileFormProps = {
    initialValues: ProfileFormValues;
    userEmail: string;
    userId: string;
    currentLogoUrl?: string | null;
};

/**
 * ProfileForm — used on the onboarding /profile page (initial account setup).
 * Save logic is unchanged; feedback is now routed through the Toast system.
 */
export function ProfileForm({ initialValues, userEmail, userId, currentLogoUrl }: ProfileFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const { toasts, addToast, removeToast } = useToasts();
    const [values, setValues] = useState<ProfileFormValues>(initialValues);
    const [saving, setSaving] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true);

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            addToast('Something went wrong. Please try again.', 'error');
            setSaving(false);
            return;
        }

        const profilePayload: Database['public']['Tables']['profiles']['Insert'] = {
            id: user.id,
            email: user.email ?? userEmail,
            full_name: values.full_name,
            company_name: values.company_name,
            phone: values.phone,
            updated_at: new Date().toISOString(),
        };

        const profileTable = supabase.from('profiles') as unknown as {
            upsert: (
                values: Database['public']['Tables']['profiles']['Insert'][],
            ) => Promise<{ error: { message: string } | null }>;
        };

        const { error: upsertError } = await profileTable.upsert([profilePayload]);

        setSaving(false);

        if (upsertError) {
            addToast('Something went wrong. Please try again.', 'error');
            return;
        }

        addToast('Profile saved. Taking you to your dashboard…', 'success');
        // Brief pause so the user sees the success toast before navigating
        setTimeout(() => {
            router.push('/app/dashboard');
            router.refresh();
        }, 1200);
    }

    return (
        <>
            <ToastContainer toasts={toasts} onClose={removeToast} />

            <form
                className="flex w-full flex-col gap-4"
                onSubmit={(e) => void handleSubmit(e)}
                aria-label="Complete your profile"
            >
                <LogoUpload
                    userId={userId}
                    currentLogoUrl={currentLogoUrl}
                    onLogoUpdated={() => { }}
                />
                <Input
                    label="Full name"
                    value={values.full_name}
                    onChange={(e) =>
                        setValues((v) => ({ ...v, full_name: e.target.value }))
                    }
                    placeholder="Ahmed Khan"
                    autoComplete="name"
                    required
                    className="py-3 px-4 h-auto"
                />
                <Input
                    label="Company name"
                    value={values.company_name}
                    onChange={(e) =>
                        setValues((v) => ({ ...v, company_name: e.target.value }))
                    }
                    placeholder="QuotePro Contracting LLC"
                    autoComplete="organization"
                    required
                    className="py-3 px-4 h-auto"
                />
                <Input
                    label="Phone"
                    value={values.phone}
                    onChange={(e) =>
                        setValues((v) => ({ ...v, phone: e.target.value }))
                    }
                    placeholder="+971 50 123 4567"
                    autoComplete="tel"
                    required
                    className="py-3 px-4 h-auto"
                />
                <Input
                    label="Email address"
                    value={userEmail}
                    readOnly
                    disabled
                    hint="Managed by your sign-in method."
                    className="py-3 px-4 h-auto"
                />
                <Button
                    type="submit"
                    loading={saving}
                    size="lg"
                    className="w-full"
                >
                    Save profile
                </Button>
            </form>
        </>
    );
}
