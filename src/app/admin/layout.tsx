import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    // 1. Ensure user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    // 2. Fetch user role from profiles table
    // (We enforce role='admin' for accessing any /admin/* route)
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'admin') {
        // Rediect non-admins to their user portal
        redirect('/profile');
    }

    return (
        <div className="flex h-screen bg-gray-950 text-white font-sans overflow-hidden">
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
