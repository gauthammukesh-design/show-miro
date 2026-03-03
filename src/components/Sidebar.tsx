import Link from 'next/link';
import { Home, Search, FolderClosed, Hash, Clock, Box, LayoutTemplate, LogOut, Gift } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function Sidebar() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <aside className="w-64 flex flex-col h-full bg-gray-dark-900 border-r border-gray-dark-700 text-gray-400 font-sans">
            {/* Header / Logo */}
            <div className="p-6 pb-2">
                <Link href="/gallery" className="flex items-baseline gap-2 group">
                    <div className="text-xl font-bold tracking-tight text-white group-hover:text-brand-500 transition-colors">
                        ShowMiro
                    </div>
                    <div className="text-sm italic font-serif text-gray-400">
                        Gallery
                    </div>
                </Link>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-hide">

                <div className="space-y-1">
                    <Link href="/gallery" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-white bg-gray-dark-800 border border-gray-dark-700 transition-colors group">
                        <Home className="w-4 h-4 text-brand-600" />
                        Inspiration Gallery
                    </Link>
                    <Link href="/gallery" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-400 rounded-lg hover:bg-gray-dark-800 hover:text-white transition-colors group">
                        <Search className="w-4 h-4 group-hover:text-brand-600 transition-colors" />
                        Search
                    </Link>
                    <Link href="/profile" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-400 rounded-lg hover:bg-gray-dark-800 hover:text-white transition-colors group">
                        <FolderClosed className="w-4 h-4 group-hover:text-brand-600 transition-colors" />
                        My Library
                    </Link>
                </div>

                {/* Categories / Tags */}
                <div>
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Categories
                    </h3>
                    <div className="space-y-1">
                        <button className="w-full flex items-center justify-between px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-gray-dark-800 rounded-md transition-colors group">
                            <span className="flex items-center gap-3">
                                <Hash className="w-4 h-4 text-gray-500 group-hover:text-brand-600 transition-colors" />
                                Tags
                            </span>
                            <span className="text-xs text-gray-600">▼</span>
                        </button>
                        <div className="pl-10 pr-3 py-1 space-y-1">
                            {['All', 'Photography', 'UI UX', 'Cyberpunk', 'Cinematic', '3D'].map((tag) => (
                                <Link key={tag} href={`/gallery?tag=${tag.toLowerCase()}`} className="block py-1 text-sm text-gray-400 hover:text-white hover:text-brand-400 transition-colors">
                                    {tag}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* More from us */}
                <div>
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        More from us
                    </h3>
                    <div className="space-y-1">
                        <a href="#" className="flex items-center gap-3 px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-gray-dark-800 rounded-md transition-colors">
                            <Box className="w-4 h-4 text-gray-500" />
                            MCP Server
                        </a>
                        <a href="#" className="flex items-center gap-3 px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-gray-dark-800 rounded-md transition-colors">
                            <LayoutTemplate className="w-4 h-4 text-gray-500" />
                            Figma Plugin
                        </a>
                    </div>
                </div>
            </nav>

            {/* Footer / User Profile */}
            <div className="p-4 border-t border-gray-dark-700 space-y-4">
                <div className="bg-gray-dark-800 rounded-xl p-3 border border-gray-dark-700 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-white truncate w-32">{user?.email?.split('@')[0] || 'User'}</span>
                        <span className="text-xs text-gray-400">Free Credits Daily</span>
                    </div>
                    <Gift className="w-4 h-4 text-brand-600" />
                </div>

                <form action="/auth/signout" method="post" className="w-full">
                    <button className="w-full flex items-center justify-center gap-2 bg-white text-gray-950 hover:bg-gray-200 transition-colors py-2 rounded-lg text-sm font-medium">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </form>
            </div>
        </aside>
    );
}
