import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/login');
    }

    return (
        <div className="flex flex-col h-full bg-gray-950 p-8 font-sans">
            <header className="flex flex-col gap-6 mb-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">My Library</h1>
                </div>
                <p className="text-gray-400">
                    Welcome to your private portal. Uploads and Favourites will go here.
                </p>
            </header>

            <div className="flex-1 border-t border-gray-dark-700/50 pt-8">
                {/* Future: Render User Uploads and Favorites tabs */}
                <div className="text-center text-gray-500 py-20 bg-gray-dark-900 border border-dashed border-gray-dark-700 rounded-xl">
                    <p>No items found. Start exploring the gallery and saving your picks!</p>
                </div>
            </div>
        </div>
    );
}
