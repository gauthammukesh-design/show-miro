import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function AdminItemsPage() {
    const supabase = await createClient();

    // Fetch items ordered by newest first
    const { data: items } = await supabase
        .from('inspiration_items')
        .select(`
            id,
            title,
            format,
            state,
            visibility,
            created_at,
            external_creator_name,
            profiles ( email )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

    return (
        <div className="p-8 font-sans h-full overflow-y-auto w-full">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white">Gallery Items</h1>
                <Link href="/admin/items/new" className="bg-brand-500 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-brand-400 transition-colors">
                    + New Item
                </Link>
            </div>

            <div className="bg-gray-dark-900 border border-gray-dark-700 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="text-xs uppercase bg-gray-dark-800 text-gray-500 border-b border-gray-dark-700">
                        <tr>
                            <th className="px-6 py-4 font-medium">Title</th>
                            <th className="px-6 py-4 font-medium">Creator</th>
                            <th className="px-6 py-4 font-medium">Format</th>
                            <th className="px-6 py-4 font-medium">State</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-dark-700">
                        {items?.map((item: any) => (
                            <tr key={item.id} className="hover:bg-gray-dark-800/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-white truncate max-w-[250px]">
                                    {item.title}
                                </td>
                                <td className="px-6 py-4">
                                    {item.external_creator_name}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2.5 py-1 bg-gray-dark-800 border border-gray-dark-600 rounded-md text-xs font-mono uppercase">
                                        {item.format}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.state === 'published' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                            item.state === 'pending_review' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                                'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                        }`}>
                                        {item.state}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link href={`/admin/items/${item.id}`} className="text-brand-500 hover:text-brand-400 font-medium text-sm">
                                        Edit
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {(!items || items.length === 0) && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    No items found. Create your first one!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
