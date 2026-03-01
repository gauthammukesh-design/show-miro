import { Heart, Plus, ExternalLink, TrendingUp } from 'lucide-react';

interface PromptCardProps {
    template: {
        id: string;
        name: string;
        description?: string;
        source_url?: string;
        created_at?: string;
    };
    imageUrl?: string;
}

export default function PromptCard({ template, imageUrl }: PromptCardProps) {
    const getHost = (url: string) => {
        try { return new URL(url).hostname.replace('www.', ''); }
        catch { return url; }
    };

    return (
        <div className="group relative break-inside-avoid mb-6 w-full rounded-2xl bg-gray-dark-800 overflow-hidden cursor-pointer shadow-sm hover:shadow-[0_0_30px_rgba(127,86,217,0.3)] transition-all duration-500">

            {/* Background Image (dictates height naturally via aspect ratio) */}
            {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt={template.name} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 ease-out block" />
            ) : (
                <div className="w-full min-h-[300px] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-500 via-brand-700 to-gray-dark-900 group-hover:scale-105 transition-transform duration-700 ease-out opacity-90" />
            )}

            {/* Always visible Bottom Scrim for Title & Description Accessibility */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-5 pt-20 flex flex-col justify-end z-10 pointer-events-none group-hover:opacity-0 transition-opacity duration-300">
                <h3 className="font-semibold text-white leading-tight line-clamp-2 text-md drop-shadow-md">
                    {template.name}
                </h3>
                {template.description && (
                    <p className="text-sm text-gray-300 line-clamp-2 mt-1.5 drop-shadow-md">
                        {template.description}
                    </p>
                )}
            </div>

            {/* Premium Hover State Backdrop Blur & Info overlay */}
            <div className="absolute inset-0 z-20 bg-gray-950/60 backdrop-blur-none group-hover:backdrop-blur-md transition-all duration-500 opacity-0 group-hover:opacity-100 flex flex-col justify-between p-5 pointer-events-none group-hover:pointer-events-auto">

                {/* Top: Creator Info & Stats */}
                <div className="flex items-start justify-between transform -translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out relative">
                    <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${template.id}&backgroundColor=ffffff`} alt="Creator avatar" className="w-10 h-10 rounded-full border-[0.5px] border-white/20 bg-gray-900 shadow-sm" />
                        <div className="flex flex-col">
                            <span className="text-white font-medium text-sm leading-tight">Amir Mušić</span>
                            <span className="text-gray-400 text-xs mt-0.5">@AmirMushich</span>
                        </div>
                    </div>
                </div>

                {/* Bottom: Actions & Metrics */}
                <div className="flex flex-col gap-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 text-xs font-medium text-gray-300">
                        <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" /> 2.2K</span>
                        <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> 167K</span>
                        <span>4d ago</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-gray-950 rounded-full font-semibold shadow-sm transition-colors text-sm">
                            <Plus className="w-4 h-4 stroke-[2.5px]" /> Use Idea
                        </button>

                        <div className="flex gap-2">
                            {template.source_url && (
                                <a href={template.source_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 bg-gray-900/60 hover:bg-gray-900/80 backdrop-blur-md rounded-full border-[0.5px] border-white/20 text-white transition-colors text-xs font-medium">
                                    View on {getHost(template.source_url).split('.')[0]} <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            )}
                            <button className="flex items-center justify-center w-9 h-9 bg-gray-900/60 hover:bg-gray-900/80 backdrop-blur-md rounded-full border-[0.5px] border-white/20 text-white transition-colors">
                                <Heart className="w-4 h-4 outline-none" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
