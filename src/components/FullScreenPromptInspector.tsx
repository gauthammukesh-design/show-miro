'use client';

import { useEffect, useState } from 'react';
import { X, Heart, TrendingUp, Download, Copy, ExternalLink, CheckCircle2, ChevronLeft, ChevronRight, PanelRightClose, PanelRightOpen } from 'lucide-react';

interface FullScreenPromptInspectorProps {
    template: any;
    imageUrl: string;
    onClose: () => void;
}

export default function FullScreenPromptInspector({ template, imageUrl, onClose }: FullScreenPromptInspectorProps) {
    const [isCopied, setIsCopied] = useState(false);
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

    // Mock variations for UI
    const mockVariations = [
        imageUrl,
        `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop&sig=1`,
        `https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=800&auto=format&fit=crop&sig=2`,
        `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop&sig=3`
    ];
    const [activeIndex, setActiveIndex] = useState(0);

    // Prevent body scroll when overlay is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const handlePrev = () => setActiveIndex((prev) => (prev > 0 ? prev - 1 : mockVariations.length - 1));
    const handleNext = () => setActiveIndex((prev) => (prev < mockVariations.length - 1 ? prev + 1 : 0));

    // Handle ESC key press and Arrows for Nav
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleCopy = () => {
        const promptText = template.description || "A futuristic neon-lit car zooming through a rainy cyberpunk city street.";
        navigator.clipboard.writeText(promptText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 900);
    };

    const getHost = (url: string) => {
        try { return new URL(url).hostname.replace('www.', ''); }
        catch { return url; }
    };

    // Calculate grid columns strictly for collapse reflow
    const gridCols = isPanelCollapsed
        ? 'grid-cols-1 lg:grid-cols-[1fr_0px]'
        : 'grid-cols-1 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_460px] 2xl:grid-cols-[1fr_500px]';

    return (
        <div
            className="fixed inset-0 z-50 h-[100dvh] w-screen flex items-center justify-center animate-in fade-in duration-300 pointer-events-auto"
            role="dialog"
            aria-modal="true"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-950/85 backdrop-blur-2xl transition-opacity pointer-events-auto"
                onClick={onClose}
                aria-hidden="true"
            >
                <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
            </div>

            {/* Layout Grid */}
            <div className={`relative w-full h-full grid ${gridCols} transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none`}>

                {/* LEFT: Media Stage */}
                <div className={`relative flex flex-col items-center justify-center p-4 lg:p-8 xl:p-12 h-full overflow-hidden transition-all duration-500 pointer-events-auto ${isPanelCollapsed ? 'w-full' : ''}`}>

                    {/* Top Right Actions (Download & Close) attached to Media Stage */}
                    <div className="absolute top-6 right-6 lg:top-8 lg:right-8 flex items-center gap-2 lg:gap-3 z-30">
                        {mockVariations.length > 1 && (
                            <div className="flex items-center px-4 h-10 bg-gray-900/60 backdrop-blur-md text-white rounded-full font-bold shadow-2xl border border-white/10 text-[13px] tracking-wide">
                                {activeIndex + 1} / {mockVariations.length}
                            </div>
                        )}
                        <button className="flex items-center justify-center w-10 h-10 bg-gray-900/60 hover:bg-gray-800 backdrop-blur-md text-white rounded-full shadow-2xl border border-white/10 transition-colors focus-visible:ring-2 ring-brand-500 outline-none" aria-label="Download variation">
                            <Download className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onClose}
                            className="flex items-center justify-center px-3.5 h-10 bg-gray-900/60 hover:bg-gray-800 backdrop-blur-md text-gray-300 hover:text-white rounded-full transition-colors border border-white/10 shadow-2xl focus-visible:ring-2 ring-brand-500 outline-none"
                            aria-label="Close Inspector"
                        >
                            <span className="text-[11px] font-bold mr-2 text-gray-400">esc</span>
                            <div className="w-[1px] h-3.5 bg-white/20 mr-2"></div>
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Wrapper for Image + Thumbnails to keep them visually attached */}
                    <div className="relative flex items-center justify-center gap-4 lg:gap-5 w-full max-w-[1400px] h-full max-h-[85vh]">

                        {/* Thumbnail Rail */}
                        {mockVariations.length > 1 && (
                            <div className="flex flex-col gap-2.5 py-4 max-h-full overflow-y-auto scrollbar-hide shrink-0 z-20 items-center justify-start w-16 lg:w-20">
                                {mockVariations.map((v, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveIndex(i)}
                                        className={`relative w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden shrink-0 transition-all ${activeIndex === i ? 'ring-2 ring-white shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-[1.03] z-10' : 'ring-1 ring-white/10 opacity-50 hover:opacity-100 hover:scale-[1.01]'}`}
                                        aria-label={`View variation ${i + 1}`}
                                        aria-selected={activeIndex === i}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={v} alt={`Variation ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Main High-Res Image Viewer */}
                        <div className="relative w-full max-w-[calc(100%-80px)] h-full flex items-center justify-center z-10 group">
                            {mockVariations[activeIndex] ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={mockVariations[activeIndex]}
                                    alt={template.name}
                                    className="max-w-full max-h-full object-contain rounded-2xl border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.5)] transition-opacity duration-300"
                                />
                            ) : (
                                <div className="w-full h-full rounded-2xl bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-500/10 via-brand-700/5 to-transparent border border-white/5 opacity-80 shadow-2xl" />
                            )}

                            {/* Hover Controls for Main Image (Next/Prev) */}
                            {mockVariations.length > 1 && (
                                <div className="absolute inset-y-0 w-full flex items-center justify-between px-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button onClick={handlePrev} className="pointer-events-auto w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-all transform hover:scale-105 shadow-xl" aria-label="Previous variation">
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button onClick={handleNext} className="pointer-events-auto w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-all transform hover:scale-105 shadow-xl" aria-label="Next variation">
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </div>
                            )}

                            {/* Pinned Open Handle on the right edge of screen when collapsed */}
                            {isPanelCollapsed && (
                                <button
                                    onClick={() => setIsPanelCollapsed(false)}
                                    className="fixed right-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-16 bg-gray-900/60 hover:bg-gray-800 backdrop-blur-3xl border border-white/10 border-r-0 rounded-l-xl shadow-[-10px_0_30px_rgba(0,0,0,0.3)] text-gray-300 hover:text-white transition-all z-50 pointer-events-auto outline-none focus-visible:ring-1 ring-brand-500"
                                    aria-label="Open Inspector Panel"
                                    title="Open Inspector"
                                >
                                    <PanelRightOpen className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                    </div>
                </div>

                {/* RIGHT: Inspector Panel */}
                {/* We use `hidden lg:block` to hide it completely on mobile. For layout collapse, we handle width natively using the grid-cols above. */}
                <div className={`relative h-full hidden lg:block z-40 transition-opacity duration-500 pointer-events-none ${isPanelCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                    {/* The internal panel with overflow-hidden */}
                    <div className="flex flex-col w-full h-full bg-gray-dark-900/95 overflow-hidden shadow-[-20px_0_60px_rgba(0,0,0,0.6)] border-l border-white/5 pointer-events-auto">

                        {/* The Header Area (Clean Rows) */}
                        <div className="flex flex-col p-6 pb-5 border-b border-white/5 gap-4 shrink-0 bg-gray-950/40">
                            {/* Row 1: Identity + External Links */}
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${template.id}&backgroundColor=ffffff`} alt="Avatar" className="w-10 h-10 rounded-full border border-white/10 bg-gray-950 shadow-sm shrink-0" />
                                    <div className="flex flex-col truncate">
                                        <span className="text-white font-bold text-[15px] tracking-wide truncate">Amir Mušić</span>
                                        <span className="text-gray-400 text-xs truncate">@AmirMushich</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5 shrink-0">
                                    {template.source_url ? (
                                        <a href={template.source_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] hover:bg-white/10 border border-white/5 rounded-full text-[11px] font-semibold text-gray-300 transition-colors">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#E5B842]"></span>
                                            {getHost(template.source_url)}
                                        </a>
                                    ) : (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-full text-[11px] font-semibold text-gray-300">
                                            <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                                            ShowMiro
                                        </div>
                                    )}
                                    <button className="p-1.5 bg-white/[0.03] hover:bg-white/10 text-gray-400 hover:text-rose-400 rounded-full border border-white/5 transition-colors" aria-label="Favorite">
                                        <Heart className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Row 2: Metrics */}
                            <div className="flex items-center gap-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1 mt-1">
                                <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" /> 2.2K Likes</span>
                                <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> 167K Views</span>
                                <span>21d ago</span>
                            </div>
                        </div>

                        {/* Scrolling Body */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide flex flex-col gap-8 bg-gray-950/20">

                            {/* Title & Navigation */}
                            <div className="flex items-start justify-between gap-4">
                                <h2 className="text-[22px] font-black text-white leading-tight drop-shadow-sm">
                                    {template.name}
                                </h2>
                            </div>

                            {/* PROMPT */}
                            <div className="flex flex-col gap-3">
                                <h4 className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Prompt</h4>
                                <div className="relative p-4 bg-gray-900 border border-white/5 rounded-2xl shadow-inner group cursor-text transition-colors focus-within:ring-1 ring-white/10 hover:bg-gray-800/80">
                                    <p className="text-gray-200 text-[13.5px] leading-relaxed font-mono selection:bg-brand-500/30 pr-10">
                                        {template.description || "A futuristic neon-lit car zooming through a rainy cyberpunk city street. Ultra-realistic, 8k resolution, cinematic lighting, sharp focus on vehicle reflections."}
                                    </p>
                                    <button
                                        onClick={handleCopy}
                                        className="absolute top-3 right-3 p-2 text-gray-400 hover:text-white bg-gray-950/80 hover:bg-brand-500 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all outline-none focus-visible:ring-2 ring-brand-500"
                                        aria-label="Copy prompt"
                                    >
                                        {isCopied ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                    {isCopied && (
                                        <span className="absolute top-4 right-12 text-[10px] font-bold text-success-400 uppercase tracking-widest px-2 py-1 bg-gray-950/90 rounded-md shadow-sm opacity-0 animate-in fade-in slide-in-from-right-2 duration-200">
                                            Copied
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* NEGATIVE PROMPT */}
                            <div className="flex flex-col gap-3">
                                <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Negative Prompt</h4>
                                <div className="p-4 bg-gray-900/50 border border-white/5 rounded-2xl">
                                    <p className="text-gray-400 text-xs leading-relaxed font-mono opacity-80 selection:bg-brand-400/20">
                                        blurry, out of focus, artificial lighting, CGI, low resolution, watermark, text, signature, bad anatomy.
                                    </p>
                                </div>
                            </div>

                            {/* PREMIUM SETTINGS UI */}
                            <div className="flex flex-col gap-3 mb-4">
                                <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1 mb-1">Configuration</h4>

                                <div className="bg-gray-900 border border-white/5 rounded-2xl overflow-hidden shadow-sm">
                                    {/* Group: Base Layer */}
                                    <div className="p-4 px-5 border-b border-white/5 flex flex-col gap-4 bg-gray-800/20">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500/80">Base Model</span>
                                            <span className="text-sm font-semibold text-white">Midjourney v6.0</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500/80">Aspect Ratio</span>
                                            <div className="px-2 py-0.5 bg-gray-800 rounded-md text-xs font-bold text-gray-200 border border-white/5 shadow-sm">16:9</div>
                                        </div>
                                    </div>

                                    {/* Group: Quality & Variables */}
                                    <div className="p-4 px-5 flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500/80">Quality</span>
                                            <span className="text-xs font-semibold text-brand-300 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">High (.q 2)</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500/80">Stylize</span>
                                            <span className="text-[13px] font-mono font-medium text-gray-300">250</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500/80">Chaos</span>
                                            <span className="text-[13px] font-mono font-medium text-gray-300">10</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Bottom Sticky Action Bar */}
                        <div className="p-5 bg-gray-950/90 border-t border-white/5 flex gap-3 shrink-0 backdrop-blur-xl">
                            <button className="flex-1 flex items-center justify-center py-3.5 bg-white hover:bg-gray-100 text-gray-950 rounded-xl font-bold shadow-lg transition-transform hover:-translate-y-0.5 text-sm">
                                Remix Prompt
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold border border-white/5 shadow-lg transition-transform hover:-translate-y-0.5 text-sm">
                                <Copy className="w-4 h-4 text-gray-400" />
                                Use as Ref
                            </button>
                        </div>

                        {/* Collapse Panel Button (Left edge of panel) */}
                        <button
                            onClick={() => setIsPanelCollapsed(true)}
                            className="absolute top-1/2 -left-3 -translate-y-1/2 flex items-center justify-center w-6 h-16 bg-gray-800 hover:bg-gray-700 border border-white/10 rounded-l-md text-gray-400 hover:text-white transition-colors z-50 outline-none focus-visible:ring-1 ring-brand-500 shadow-md pointer-events-auto"
                            aria-label="Collapse Inspector Panel"
                            title="Collapse Side Panel"
                        >
                            <PanelRightClose className="w-4 h-4 ml-1" />
                        </button>

                    </div>
                </div>

            </div>
        </div>
    );
}
