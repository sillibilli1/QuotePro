import { requireAdmin } from '@/lib/admin/auth';
import AdminShell from '@/components/admin/AdminShell';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await requireAdmin();
    return <AdminShell>{children}</AdminShell>;
}
