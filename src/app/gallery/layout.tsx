import Sidebar from '@/components/Sidebar';

export default function LibraryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden font-sans">
            <Sidebar />
            <main className="flex-1 overflow-y-auto relative bg-gray-950">
                {children}
            </main>
        </div>
    );
}
