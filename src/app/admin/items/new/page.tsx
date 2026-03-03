'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { publishItem, fetchTaxonomy } from '../../actions';

export default function NewItemPage() {
    const reader = new FileReader(); // Just scoping this out
    const supabase = createClient();
    const router = useRouter();

    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const [categories, setCategories] = useState<any[]>([]);
    const [tags, setTags] = useState<any[]>([]);

    useEffect(() => {
        // Load taxonomy for checkboxes
        fetchTaxonomy().then(data => {
            setCategories(data.categories);
            setTags(data.tags);
        });
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const selectedFile = e.target.files[0];
        setFile(selectedFile);

        // Create local preview
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file) {
            alert("Image file is required.");
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData(e.currentTarget);

            // 1. Upload the image directly via Supabase Client Storage API
            // Admin is allowed to upload directly to inspiration-public
            const ext = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('inspiration-public')
                .upload(fileName, file, { upsert: false });

            if (uploadError) throw new Error(`Upload Failed: ${uploadError.message}`);

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('inspiration-public')
                .getPublicUrl(uploadData.path);

            // Append the image_url to our Server Action form payload
            formData.append('image_url', publicUrl);
            formData.append('thumbnail_url', publicUrl); // For MVP, we'll use the same URL

            // We need the admin's profile ID
            const { data: { user } } = await supabase.auth.getUser();
            if (user) formData.append('admin_id', user.id);

            // 3. Fire the Server Action
            await publishItem(formData);

            alert('Item published successfully!');
            router.push('/admin');

        } catch (error: any) {
            console.error(error);
            alert(error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-6 font-sans">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Create Gallery Item</h1>
            <p className="text-gray-400 mb-8">Upload an image and attach its metadata to publish directly to the public gallery.</p>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* 1. Image Upload Section */}
                <div className="bg-gray-dark-900 border border-gray-dark-700 p-6 rounded-xl">
                    <h2 className="text-lg font-semibold text-white mb-4">Media</h2>
                    <div className="flex items-start gap-8">
                        {preview ? (
                            <div className="w-64 h-64 rounded-xl overflow-hidden border border-gray-dark-700 relative shrink-0">
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => { setFile(null); setPreview(null); }} className="absolute top-2 right-2 bg-black/60 hover:bg-black p-2 rounded-lg text-xs text-white backdrop-blur-md transition-colors">
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <label className="w-64 h-64 border-2 border-dashed border-gray-dark-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-dark-800 transition-colors shrink-0 group">
                                <span className="text-gray-400 group-hover:text-white mb-2 font-medium">Click to upload</span>
                                <span className="text-xs text-gray-500">JPG, PNG, WEBP</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </label>
                        )}

                        <div className="flex-1 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">External Creator Name *</label>
                                <input required type="text" name="external_creator_name" className="w-full bg-gray-950 border border-gray-dark-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500" placeholder="e.g. Armin AI" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Creator Handle *</label>
                                <input required type="text" name="external_creator_handle" className="w-full bg-gray-950 border border-gray-dark-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500" placeholder="e.g. @Arminn_Ai" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Creator Avatar URL *</label>
                                <input required type="url" name="external_creator_avatar_url" className="w-full bg-gray-950 border border-gray-dark-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500" placeholder="https://..." defaultValue="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=128&h=128&auto=format&fit=crop" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">External Post Date *</label>
                                <input required type="datetime-local" name="external_post_date" className="w-full bg-gray-950 text-white rounded-lg px-4 py-2 border border-gray-dark-700 [color-scheme:dark]" defaultValue={new Date().toISOString().slice(0, 16)} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Primary Metadata */}
                <div className="bg-gray-dark-900 border border-gray-dark-700 p-6 rounded-xl space-y-5">
                    <h2 className="text-lg font-semibold text-white">Item Metadata</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Title *</label>
                        <input required type="text" name="title" className="w-full bg-gray-950 border border-gray-dark-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500" placeholder="Catchy title..." />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Format *</label>
                            <select name="format" className="w-full bg-gray-950 border border-gray-dark-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500">
                                <option value="prompt">Prompt (Requires Prompt Text)</option>
                                <option value="image">Image Only</option>
                                <option value="template">Template</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">AI Model</label>
                            <input type="text" name="ai_model" className="w-full bg-gray-950 border border-gray-dark-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500" placeholder="e.g. Midjourney v6" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <textarea name="description" rows={2} className="w-full bg-gray-950 border border-gray-dark-700 rounded-lg px-4 py-2 text-white resize-y focus:outline-none focus:border-brand-500" placeholder="Short summary describing the vibe..." />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Prompt Text</label>
                        <textarea name="prompt_text" rows={4} className="w-full bg-gray-950 border border-gray-dark-700 rounded-lg px-4 py-2 text-white resize-y focus:outline-none focus:border-brand-500 font-mono text-sm" placeholder="The exact generation prompt..." />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Negative Prompt</label>
                        <textarea name="negative_prompt" rows={2} className="w-full bg-gray-950 border border-gray-dark-700 rounded-lg px-4 py-2 text-white resize-y focus:outline-none focus:border-brand-500 font-mono text-sm" placeholder="What to exclude..." />
                    </div>
                </div>

                {/* 3. Taxonomy */}
                <div className="bg-gray-dark-900 border border-gray-dark-700 p-6 rounded-xl space-y-5">
                    <h2 className="text-lg font-semibold text-white">Taxonomy</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Categories */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-300 mb-3 border-b border-gray-dark-700 pb-2">Categories</h3>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-dark-600">
                                {categories.map(c => (
                                    <label key={c.id} className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" name="category_ids" value={c.id} className="w-4 h-4 rounded border-gray-dark-600 bg-gray-950 text-brand-500 focus:ring-brand-500 focus:ring-offset-gray-900" />
                                        <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{c.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-300 mb-3 border-b border-gray-dark-700 pb-2">Tags</h3>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-dark-600">
                                {tags.map(t => (
                                    <label key={t.id} className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" name="tag_ids" value={t.id} className="w-4 h-4 rounded border-gray-dark-600 bg-gray-950 text-brand-500 focus:ring-brand-500 focus:ring-offset-gray-900" />
                                        <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{t.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end pt-4 pb-20">
                    <button
                        type="submit"
                        disabled={uploading}
                        className="bg-brand-500 text-white font-semibold flex items-center gap-2 px-8 py-3 rounded-lg hover:bg-brand-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Publishing...
                            </>
                        ) : 'Publish Gallery Item'}
                    </button>
                </div>

            </form>
        </div>
    );
}
