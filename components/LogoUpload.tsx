'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';

type LogoUploadProps = {
    userId: string;
    currentLogoUrl?: string | null;
    onLogoUpdated: (url: string | null) => void;
};

export function LogoUpload({ userId, currentLogoUrl, onLogoUpdated }: LogoUploadProps) {
    const supabase = createClient();
    const [uploading, setUploading] = useState(false);
    const [logoUrl, setLogoUrl] = useState(currentLogoUrl);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert('File size must be less than 2MB');
            return;
        }

        setUploading(true);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}/logo.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('logos')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('logos')
                .getPublicUrl(fileName);

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ company_logo_url: publicUrl })
                .eq('id', userId);

            if (updateError) throw updateError;

            setLogoUrl(publicUrl);
            onLogoUpdated(publicUrl);
        } catch (error) {
            console.error('Error uploading logo:', error);
            alert('Failed to upload logo');
        } finally {
            setUploading(false);
        }
    }

    async function handleRemove() {
        setUploading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ company_logo_url: null })
                .eq('id', userId);

            if (error) throw error;

            setLogoUrl(null);
            onLogoUpdated(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error) {
            console.error('Error removing logo:', error);
            alert('Failed to remove logo');
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-200">Company Logo</label>

            {logoUrl ? (
                <div className="flex items-center gap-4">
                    <div className="relative h-16 w-32 rounded-lg border border-slate-700 bg-white p-2">
                        <Image
                            src={logoUrl}
                            alt="Company logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <Button
                        type="button"
                        onClick={handleRemove}
                        disabled={uploading}
                        variant="secondary"
                        size="sm"
                    >
                        Remove
                    </Button>
                </div>
            ) : (
                <div className="flex items-center gap-3">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="hidden"
                        id="logo-upload"
                    />
                    <label htmlFor="logo-upload">
                        <Button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            variant="secondary"
                            size="sm"
                            asChild
                        >
                            <span>{uploading ? 'Uploading...' : 'Upload Logo'}</span>
                        </Button>
                    </label>
                    <span className="text-xs text-slate-400">PNG, JPG up to 2MB</span>
                </div>
            )}
        </div>
    );
}
