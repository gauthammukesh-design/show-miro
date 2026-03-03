import { createClient as createServerClient } from '@/utils/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import PromptGallery from '@/components/PromptGallery';
export default async function InspirationGallery() {
    const supabase = await createServerClient();

    // Protect the route - Removed for public gallery
    // We only fetch the user to pass down for UI state if needed, but not redirecting
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch Public Prompts seamlessly avoiding the current RLS infinite recursion by using the Service Role
    const serviceSupabase = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: prompts } = await serviceSupabase
        .from('inspiration_items')
        .select('*')
        .eq('state', 'published')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false });

    return (
        <div className="flex flex-col h-full bg-gray-950 p-8 font-sans">
            <header className="flex flex-col gap-6 mb-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Inspiration Gallery</h1>
                </div>

                <div className="flex items-center justify-between w-full overflow-x-auto scrollbar-hide pb-2">
                    <div className="flex items-center gap-2">
                        {/* Source Filters - Pill styled */}
                        <button className="px-5 py-2 bg-white text-gray-950 rounded-full text-sm font-semibold shadow-sm transition-colors hover:bg-gray-100 whitespace-nowrap">All</button>
                        <button className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-dark-800 rounded-full text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap">
                            <span className="w-3.5 h-3.5 rounded-full bg-[#E5B842]"></span> NanoBanana Pro
                        </button>
                        <button className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-dark-800 rounded-full text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap">
                            <span className="w-3.5 h-3.5 rounded-full bg-brand-500"></span> Image 1.5
                        </button>
                        <button className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-dark-800 rounded-full text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap">
                            <span className="w-3.5 h-3.5 rounded-full bg-blue-500"></span> Midjourney
                        </button>
                    </div>

                    <div className="flex bg-gray-dark-900 border border-gray-dark-700/50 rounded-full p-1 text-sm shrink-0 ml-4 hidden md:flex">
                        <button className="px-5 py-1.5 bg-gray-dark-700/50 text-white rounded-full font-medium transition-colors shadow-sm text-sm">Featured</button>
                        <button className="px-5 py-1.5 text-gray-400 hover:text-white rounded-full font-medium transition-colors text-sm">Newest</button>
                        <button className="px-5 py-1.5 text-gray-400 hover:text-white rounded-full font-medium transition-colors text-sm">Popular</button>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto pb-10 scrollbar-hide">
                <PromptGallery prompts={prompts || []} />
            </div>
        </div>
    );
}
