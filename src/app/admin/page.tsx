import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function AdminDashboard() {
    const supabase = await createClient();

    // Fetch quick stats
    const { count: totalItems } = await supabase
        .from('inspiration_items')
        .select('*', { count: 'exact', head: true });

    const { count: pendingItems } = await supabase
        .from('inspiration_items')
        .select('*', { count: 'exact', head: true })
        .eq('state', 'pending_review');

    return (
        <div className="p-8 font-sans h-full overflow-y-auto w-full">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-6">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-dark-900 border border-gray-dark-700 rounded-xl p-6">
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Total Items</h3>
                    <p className="text-3xl font-bold text-white">{totalItems ?? 0}</p>
                </div>
                <div className="bg-brand-900/20 border border-brand-500/30 rounded-xl p-6">
                    <h3 className="text-sm font-medium text-brand-400 mb-1">Pending Review</h3>
                    <p className="text-3xl font-bold text-brand-500">{pendingItems ?? 0}</p>
                </div>
            </div>

            <div className="flex gap-4">
                <Link href="/admin/items" className="bg-white text-gray-950 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                    Manage Items
                </Link>
                <Link href="/admin/items/new" className="bg-brand-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-400 transition-colors">
                    Upload New Item
                </Link>
            </div>
        </div>
    );
}
