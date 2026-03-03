import { adminClient } from '@/utils/supabase/admin';

export async function fetchTaxonomy() {
    const [categoriesResult, tagsResult] = await Promise.all([
        adminClient.from('categories').select('id, name').order('name'),
        adminClient.from('tags').select('id, name').order('name')
    ]);

    return {
        categories: categoriesResult.data || [],
        tags: tagsResult.data || []
    };
}

export async function publishItem(formData: FormData) {
    'use server'

    // We are trusting the form payload here since this is specifically Admin restricted
    const payload = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        prompt_text: formData.get('prompt_text') as string,
        negative_prompt: formData.get('negative_prompt') as string,
        ai_model: formData.get('ai_model') as string,
        format: formData.get('format') as string,

        // Attribution (NOT NULL fields)
        external_creator_name: formData.get('external_creator_name') as string,
        external_creator_handle: formData.get('external_creator_handle') as string,
        external_creator_avatar_url: formData.get('external_creator_avatar_url') as string,
        external_post_date: new Date(formData.get('external_post_date') as string).toISOString(),

        // The image_url is returned from the client-side Storage upload component
        image_url: formData.get('image_url') as string,

        // Settings Jsonb
        ai_settings: {
            aspect_ratio: formData.get('aspect_ratio') as string || '1:1',
            stylize: formData.get('stylize') ? parseInt(formData.get('stylize') as string) : undefined
        },

        // Admin Force publish
        state: 'published',
        visibility: 'public',
        uploader_profile_id: formData.get('admin_id') as string // passed implicitly or explicitly
    };

    const { data: insertedItem, error } = await adminClient
        .from('inspiration_items')
        .insert(payload)
        .select('id')
        .single();

    if (error) {
        throw new Error(error.message);
    }

    // Process Taxonomy
    const categoryIds = formData.getAll('category_ids') as string[];
    const tagIds = formData.getAll('tag_ids') as string[];

    if (categoryIds.length > 0) {
        await adminClient.from('item_categories').insert(
            categoryIds.map(id => ({ item_id: insertedItem.id, category_id: id }))
        );
    }

    if (tagIds.length > 0) {
        await adminClient.from('item_tags').insert(
            tagIds.map(id => ({ item_id: insertedItem.id, tag_id: id }))
        );
    }

    return insertedItem.id;
}
