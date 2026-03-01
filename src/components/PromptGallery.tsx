'use client';

import { useState } from 'react';
import PromptCard from '@/components/PromptCard';
import FullScreenPromptInspector from '@/components/FullScreenPromptInspector';

// Temporary helper to provide high-quality mock images for the seeded data
const getMockImage = (name: string) => {
    if (name.includes('Headphone')) return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop';
    if (name.includes('Holographic')) return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop';
    if (name.includes('Fashion')) return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop';
    if (name.includes('Car')) return 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=800&auto=format&fit=crop';
    if (name.includes('Interior')) return 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800&auto=format&fit=crop';
    if (name.includes('Conceptual')) return 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&h=1000&auto=format&fit=crop';
    if (name.includes('Culinary')) return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop';
    if (name.includes('Gadget')) return 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?q=80&w=800&h=1000&auto=format&fit=crop';
    if (name.includes('Nature')) return 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop';
    if (name.includes('Floral')) return 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=800&h=1200&auto=format&fit=crop';
    if (name.includes('Dashboard')) return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&h=800&auto=format&fit=crop';
    return `https://picsum.photos/seed/${name.length}/600/800`;
};

interface PromptGalleryProps {
    prompts: any[];
}

export default function PromptGallery({ prompts }: PromptGalleryProps) {
    const [selectedPrompt, setSelectedPrompt] = useState<any | null>(null);

    return (
        <>
            {prompts && prompts.length > 0 ? (
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
                    {prompts.map((template) => (
                        <div key={template.id} onClick={() => setSelectedPrompt(template)}>
                            <PromptCard template={template} imageUrl={getMockImage(template.name)} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-gray-500 pt-20">
                    <div className="w-16 h-16 mb-4 rounded-xl bg-gray-dark-900 border border-gray-dark-700 flex items-center justify-center">
                        <span className="text-2xl">🪄</span>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-1">The canvas is blank</h3>
                    <p className="text-sm">Fetching trending viral prompts...</p>
                </div>
            )}

            {selectedPrompt && (
                <FullScreenPromptInspector
                    template={selectedPrompt}
                    imageUrl={getMockImage(selectedPrompt.name)}
                    onClose={() => setSelectedPrompt(null)}
                />
            )}
        </>
    );
}
