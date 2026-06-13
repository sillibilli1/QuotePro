import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

export default function AdminShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-gray-950">
            <AdminSidebar />
            <main className="flex-1">
                <AdminHeader />
                <div className="p-8">{children}</div>
            </main>
        </div>
    );
}
