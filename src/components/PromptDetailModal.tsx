'use client';

import { useEffect, useState } from 'react';
import { X, Heart, TrendingUp, Plus, Download, Copy, ExternalLink, Check } from 'lucide-react';

interface PromptDetailModalProps {
    template: any;
    imageUrl: string;
    onClose: () => void;
}

export default function PromptDetailModal({ template, imageUrl, onClose }: PromptDetailModalProps) {
    const [isCopied, setIsCopied] = useState(false);
    const [isLeftExpanded, setIsLeftExpanded] = useState(false);

    // Lock body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    // Handle ESC key press
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleCopy = () => {
        const promptText = `Master Prompt: ${template.name}\n${template.description || ''}`;
        navigator.clipboard.writeText(promptText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const getHost = (url: string) => {
        try { return new URL(url).hostname.replace('www.', ''); }
        catch { return url; }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12 animate-in fade-in duration-300"
            role="dialog"
            aria-modal="true"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-950/80 backdrop-blur-md transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Container */}
            <div className={`relative flex flex-col lg:flex-row w-full max-w-7xl h-[90vh] lg:h-[85vh] bg-gray-dark-900 border border-white/10 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] transform animate-in zoom-in-95 duration-300 ease-out transition-all ${isLeftExpanded ? 'max-w-5xl' : ''}`}>

                {/* Close Button (Absolute Top Right) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2.5 bg-gray-900/50 hover:bg-gray-800 backdrop-blur-md text-gray-300 hover:text-white rounded-full transition-colors border border-white/10 shadow-sm"
                    aria-label="Close modal"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Left Panel: Media Preview */}
                <div className={`relative bg-gray-950 h-[40vh] lg:h-full flex items-center justify-center p-4 md:p-6 transition-all duration-500 ${isLeftExpanded ? 'lg:w-full' : 'lg:w-1/2'}`}>
                    {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={imageUrl}
                            alt={template.name}
                            className="w-full h-full object-contain rounded-xl shadow-lg"
                        />
                    ) : (
                        <div className="w-full h-full rounded-xl bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-500 via-brand-700 to-gray-dark-900 opacity-90" />
                    )}

                    {/* Download Image Button */}
                    <button className="absolute bottom-6 right-6 lg:bottom-8 lg:right-8 flex items-center gap-2 px-4 py-2 bg-gray-900/60 hover:bg-gray-800/80 backdrop-blur-md text-white rounded-full font-medium shadow-lg border border-white/10 transition-colors text-sm">
                        <Download className="w-4 h-4" /> Download
                    </button>

                    {/* Expand Toggle (Desktop Only) */}
                    <button
                        onClick={() => setIsLeftExpanded(!isLeftExpanded)}
                        className="hidden lg:flex absolute top-1/2 -right-4 z-10 p-1.5 bg-gray-800 text-gray-400 hover:text-white rounded-full border border-gray-700 shadow-md transition-colors transform -translate-y-1/2"
                        title={isLeftExpanded ? "Show Details" : "Expand Image"}
                    >
                        <div className={`transform transition-transform ${isLeftExpanded ? 'rotate-180' : ''}`}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                        </div>
                    </button>

                    {/* Sidebar Strip for Variations (Mock) */}
                    <div className="absolute left-6 top-1/2 transform -translate-y-1/2 hidden md:flex flex-col gap-3">
                        {imageUrl && (
                            <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={imageUrl} alt="Variation 1" className="w-14 h-14 rounded-lg object-cover border-2 border-brand-500 cursor-pointer shadow-md" />
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={imageUrl} alt="Variation 2" className="w-14 h-14 rounded-lg object-cover border border-white/20 opacity-60 hover:opacity-100 cursor-pointer transition-opacity" />
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={imageUrl} alt="Variation 3" className="w-14 h-14 rounded-lg object-cover border border-white/20 opacity-60 hover:opacity-100 cursor-pointer transition-opacity" />
                            </>
                        )}
                    </div>
                </div>

                {/* Right Panel: Prompt & Metadata */}
                <div className={`flex flex-col h-full bg-gray-dark-800 border-l border-white/5 transition-all duration-500 overflow-y-auto scrollbar-hide ${isLeftExpanded ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden' : 'lg:w-1/2 opacity-100'}`}>

                    {/* Header: Creator & Metrics */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 p-6 lg:p-8 border-b border-white/5 pb-6">
                        <div className="flex items-center gap-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${template.id}&backgroundColor=ffffff`} alt="Creator avatar" className="w-12 h-12 rounded-full border border-white/10 bg-gray-900 shadow-sm" />
                            <div className="flex flex-col">
                                <span className="text-white font-semibold text-base">Amir Mušić</span>
                                <span className="text-gray-400 text-sm">@AmirMushich</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            {template.source_url && (
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-900/50 border border-white/10 rounded-full text-xs font-medium text-gray-300">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#E5B842]"></span>
                                    {getHost(template.source_url)}
                                </div>
                            )}
                            <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                                <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" /> 2.2K</span>
                                <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> 167K</span>
                                <span>21d ago</span>
                            </div>
                        </div>
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 p-6 lg:p-8 overflow-y-auto">

                        <h2 className="text-2xl font-bold text-white mb-6 leading-tight">
                            {template.name}
                        </h2>

                        {/* Prompt Block */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Prompt</h4>
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-1.5 text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors"
                                >
                                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                    {isCopied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <div className="p-4 bg-gray-900 border border-white/5 rounded-xl text-gray-300 text-sm leading-relaxed font-mono">
                                {template.description || "Extreme close-up macro photography of a blooming exotic flower with intricate water droplets reflecting the ambient soft light. Hyper-realistic, 8k resolution, cinematic lighting, sharp focus on petals, fluid dynamics."}
                            </div>
                        </div>

                        {/* Negative Prompt Block (Mock) */}
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Negative Prompt</h4>
                            <div className="p-4 bg-gray-900 border border-white/5 rounded-xl text-gray-400 text-sm leading-relaxed font-mono opacity-80">
                                blurry, out of focus, artificial lighting, CGI, low resolution, watermark, text, signature, bad anatomy, deformed petals.
                            </div>
                        </div>

                        {/* Settings Block */}
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Settings</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-gray-900 border border-white/5 rounded-lg flex flex-col gap-1">
                                    <span className="text-xs text-gray-500 uppercase">Model</span>
                                    <span className="text-sm text-gray-200 font-medium">Midjourney v6.0</span>
                                </div>
                                <div className="p-3 bg-gray-900 border border-white/5 rounded-lg flex flex-col gap-1">
                                    <span className="text-xs text-gray-500 uppercase">Aspect Ratio</span>
                                    <span className="text-sm text-gray-200 font-medium">16:9</span>
                                </div>
                                <div className="p-3 bg-gray-900 border border-white/5 rounded-lg flex flex-col gap-1">
                                    <span className="text-xs text-gray-500 uppercase">Stylize</span>
                                    <span className="text-sm text-gray-200 font-medium">250</span>
                                </div>
                                <div className="p-3 bg-gray-900 border border-white/5 rounded-lg flex flex-col gap-1">
                                    <span className="text-xs text-gray-500 uppercase">Chaos</span>
                                    <span className="text-sm text-gray-200 font-medium">10</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Bottom Actions Footer */}
                    <div className="p-6 lg:p-8 bg-gray-dark-900/50 border-t border-white/5 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">

                        <div className="flex gap-3 w-full sm:w-auto">
                            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-100 text-gray-950 rounded-full font-bold shadow-sm transition-colors text-sm">
                                <Plus className="w-4 h-4 stroke-[2.5px]" />
                                Remix
                            </button>
                            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 rounded-full font-semibold shadow-sm transition-colors text-sm">
                                <Copy className="w-4 h-4" />
                                Use as Ref
                            </button>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                            {template.source_url && (
                                <a href={template.source_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-4 py-3 bg-transparent hover:bg-gray-800 text-gray-300 hover:text-white rounded-full transition-colors text-sm font-medium">
                                    Source <ExternalLink className="w-4 h-4" />
                                </a>
                            )}
                            <button className="flex items-center justify-center w-11 h-11 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-full transition-colors border border-gray-600">
                                <Heart className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
