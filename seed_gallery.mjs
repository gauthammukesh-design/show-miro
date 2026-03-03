import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables matching Next.js expectation
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
    console.log("🌱 Starting ShowMiro MVP Seed...");

    // 1. Get or create the main Admin user
    const email = "gauthammukesh@gmail.com";
    let uploaderProfileId = null;

    // Check if user exists
    const { data: users, error: authErr } = await supabase.auth.admin.listUsers();
    if (authErr) {
        console.error("❌ Failed to fetch users:", authErr);
        return;
    }

    let adminUser = users.users.find((u) => u.email === email);
    if (!adminUser) {
        console.log(`👤 Creating admin user: ${email}...`);
        const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
            email,
            password: "password123",
            email_confirm: true,
            user_metadata: { full_name: "Gautham Mukesh" },
        });
        if (createErr) {
            console.error("❌ Failed to create admin user:", createErr);
            return;
        }
        adminUser = newUser.user;
    } else {
        console.log(`✅ Admin user found: ${email} (${adminUser.id})`);
    }

    // Ensure profile exists and make them an admin
    // (The trigger might have made the profile, but let's ensure the role)
    console.log(`🛡️ Promoting ${email} to Admin...`);
    const { data: profile, error: profErr } = await supabase
        .from("profiles")
        .upsert(
            { id: adminUser.id, email: email, role: "admin" },
            { onConflict: "id" }
        )
        .select("id")
        .single();

    if (profErr) {
        console.error("❌ Failed to upsert profile:", profErr);
        return;
    }
    uploaderProfileId = profile.id;

    // 2. Fetch categories and tags to assign to seeds
    const { data: categories } = await supabase.from("categories").select("id, slug");
    const { data: tags } = await supabase.from("tags").select("id, slug");

    if (!categories || categories.length === 0 || !tags || tags.length === 0) {
        console.error("❌ Taxonomy missing! Run the 002 migration first.");
        return;
    }

    const getSlugId = (arr, slug) => arr.find((item) => item.slug === slug)?.id;

    // 3. Define the premium seed items
    const premiumItems = [
        {
            title: "Neon City Rainy Night",
            description: "A highly detailed cyberpunk city street during a rainstorm, glowing neon lights reflected in puddles.",
            format: "prompt",
            prompt_text: "Cyberpunk street, Tokyo at night, heavy rain, neon signs reflecting in puddles, cinematic lighting, photorealistic, 8k resolution, Unreal Engine 5 render --ar 16:9 --v 6.0",
            negative_prompt: "daylight, sunny, blurry, human faces, text, watermark",
            ai_model: "Midjourney v6",
            ai_settings: { aspect_ratio: "16:9", stylize: 250 },
            image_url: "https://images.unsplash.com/photo-1534011546717-40898ab2db8c?q=80&w=2800&auto=format&fit=crop",
            thumbnail_url: "https://images.unsplash.com/photo-1534011546717-40898ab2db8c?q=80&w=800&auto=format&fit=crop",
            external_creator_name: "Amir Mušić",
            external_creator_handle: "@AmirMushich",
            external_creator_avatar_url: "https://images.unsplash.com/profile-1441298803695-accd94000cac?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&cs=tinysrgb&fit=crop&h=128&w=128&s=32030043516518a24eeeb81db3c18086",
            external_post_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
            state: "published",
            visibility: "public",
            uploader_profile_id: uploaderProfileId,
            _categories: ["photography"],
            _tags: ["cyberpunk", "cinematic", "dark-mode"],
        },
        {
            title: "Glassmorphic FinTech Dashboard",
            description: "Clean, frosted glass UI elements featuring analytics charts and glowing indicators.",
            format: "prompt",
            prompt_text: "A dark-mode analytics dashboard UI design with glassmorphic charts and glowing financial indicators. Clean, premium, modern design, highly detailed, dribbble, behance style --ar 4:3",
            negative_prompt: "blurry, low resolution, watermark, text, signature, bad anatomy, flat design",
            ai_model: "Midjourney v6",
            ai_settings: { aspect_ratio: "4:3", stylize: 150 },
            image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2800&auto=format&fit=crop",
            thumbnail_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
            external_creator_name: "Sarah UI",
            external_creator_handle: "@SarahUI",
            external_creator_avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=128&h=128&auto=format&fit=crop",
            external_post_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
            state: "published",
            visibility: "public",
            uploader_profile_id: uploaderProfileId,
            _categories: ["ui-ux"],
            _tags: ["glassmorphism", "dark-mode"],
        },
        {
            title: "Isometric Smart Home App",
            description: "A 3D isometric representation of a smart home dashboard interface.",
            format: "prompt",
            prompt_text: "3d isometric ui ux design, smart home app dashboard floating in space, soft lighting, clay render style, minimalist, dribbble style --ar 1:1",
            ai_model: "DALL-E 3",
            ai_settings: { style: "vivid" },
            image_url: "https://images.unsplash.com/photo-1558002038-1cb81ec4bc73?q=80&w=2800&auto=format&fit=crop",
            thumbnail_url: "https://images.unsplash.com/photo-1558002038-1cb81ec4bc73?q=80&w=800&auto=format&fit=crop",
            external_creator_name: "Dave Design",
            external_creator_handle: "@DaveD",
            external_creator_avatar_url: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=128&h=128&auto=format&fit=crop",
            external_post_date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            state: "published",
            visibility: "public",
            uploader_profile_id: uploaderProfileId,
            _categories: ["ui-ux", "3d-renders"],
            _tags: ["isometric", "minimalist"],
        },
        {
            title: "Minimalist Architectural Villa",
            description: "A concrete minimalist villa overlooking the ocean, bathed in soft afternoon light.",
            format: "prompt",
            prompt_text: "Exterior view, contemporary minimalist concrete brutalist villa, large glass windows, overlooking ocean, warm afternoon sunlight, architectural photography, photorealistic --ar 16:9",
            negative_prompt: "people, cluttered, cartoon, illustration",
            ai_model: "Midjourney v6",
            ai_settings: { aspect_ratio: "16:9" },
            image_url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2800&auto=format&fit=crop",
            thumbnail_url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop",
            external_creator_name: "ArchViz Pros",
            external_creator_handle: "@ArchViz",
            external_creator_avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=128&h=128&auto=format&fit=crop",
            external_post_date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
            state: "published",
            visibility: "public",
            uploader_profile_id: uploaderProfileId,
            _categories: ["architecture"],
            _tags: ["minimalist", "cinematic"],
        },
        {
            title: "Vintage Botanical Illustration",
            description: "A delicate, hand-drawn style illustration of wild forest mushrooms and ferns.",
            format: "prompt",
            prompt_text: "Vintage botanical illustration, field guide style, wild mushrooms and ferns, ink and watercolor, aged paper background, highly detailed, scientific drawing --ar 3:4",
            ai_model: "Midjourney v5.2",
            ai_settings: { aspect_ratio: "3:4" },
            image_url: "https://images.unsplash.com/photo-1588691880436-b5d19dcb661c?q=80&w=2800&auto=format&fit=crop",
            thumbnail_url: "https://images.unsplash.com/photo-1588691880436-b5d19dcb661c?q=80&w=800&auto=format&fit=crop",
            external_creator_name: "Emma Drawings",
            external_creator_handle: "@emmadraws",
            external_creator_avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=128&h=128&auto=format&fit=crop",
            external_post_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
            state: "published",
            visibility: "public",
            uploader_profile_id: uploaderProfileId,
            _categories: ["digital-art"],
            _tags: ["retro"],
        },
        {
            title: "Luminous Perfume Bottle",
            description: "A luxury perfume bottle product shot resting on dark water with ripples and dramatic studio lighting.",
            format: "prompt",
            prompt_text: "commercial product photography, luxury perfume bottle floating on dark water, dramatic studio lighting, ripples, glowing reflections, highly detailed, 8k --ar 4:5",
            ai_model: "Midjourney v6",
            ai_settings: { aspect_ratio: "4:5", stylize: 300 },
            image_url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=2800&auto=format&fit=crop",
            thumbnail_url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop",
            external_creator_name: "Studio Light",
            external_creator_handle: "@studiolight",
            external_creator_avatar_url: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=128&h=128&auto=format&fit=crop",
            external_post_date: new Date().toISOString(),
            state: "published",
            visibility: "public",
            uploader_profile_id: uploaderProfileId,
            _categories: ["product-design", "photography"],
            _tags: ["studio-lighting", "cinematic", "macro"],
        },
        // Adding 4 more to reach 10
        {
            title: "Surreal Floating Monument",
            description: "A massive geometric monument floating above a desert of pink sand, glowing aura.",
            format: "prompt",
            prompt_text: "Surrealist landscape, solitary massive black monolithic obelisk floating over a vast desert of pink sand, glowing blue aura, dramatic sky, cinematic --ar 16:9",
            ai_model: "DALL-E 3",
            image_url: "https://images.unsplash.com/photo-1494950346376-74fcce02434f?q=80&w=2800&auto=format&fit=crop",
            thumbnail_url: "https://images.unsplash.com/photo-1494950346376-74fcce02434f?q=80&w=800&auto=format&fit=crop",
            external_creator_name: "Dreamer",
            external_creator_handle: "@dreamart",
            external_creator_avatar_url: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=128&h=128&auto=format&fit=crop",
            external_post_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
            state: "published",
            visibility: "public",
            uploader_profile_id: uploaderProfileId,
            _categories: ["digital-art"],
            _tags: ["surreal", "cinematic"],
        },
        {
            title: "Modern FinTech Logo",
            description: "A dynamic, colorful vector logo concept for a startup.",
            format: "prompt",
            prompt_text: "Logo design, modern fintech startup, abstract geometric shape, vibrant gradient colors, clean white background, vector art styling --v 5.2",
            negative_prompt: "photorealistic, noisy, messy, text",
            ai_model: "Midjourney v5.2",
            image_url: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2800&auto=format&fit=crop",
            thumbnail_url: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=800&auto=format&fit=crop",
            external_creator_name: "Logo Smith",
            external_creator_handle: "@logosmith",
            external_creator_avatar_url: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?q=80&w=128&h=128&auto=format&fit=crop",
            external_post_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
            state: "published",
            visibility: "public",
            uploader_profile_id: uploaderProfileId,
            _categories: ["branding"],
            _tags: ["vector", "minimalist"],
        },
        {
            title: "Macro Dew Drop",
            description: "Ultra close-up of a single water drop on a green leaf reflecting the surrounding forest.",
            format: "prompt",
            prompt_text: "Macro photography, single perfect water dew drop on a bright green vibrant leaf, reflecting the lush forest around it, soft morning light, highly detailed 8k --ar 3:2",
            ai_model: "Midjourney v6",
            image_url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2800&auto=format&fit=crop",
            thumbnail_url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop",
            external_creator_name: "Nature Lens",
            external_creator_handle: "@naturelens",
            external_creator_avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=128&h=128&auto=format&fit=crop",
            external_post_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
            state: "published",
            visibility: "public",
            uploader_profile_id: uploaderProfileId,
            _categories: ["photography"],
            _tags: ["macro"],
        },
        {
            title: "Stylized Typographic Poster",
            description: "A bold, retro poster utilizing stark typography and duotone colors.",
            format: "prompt",
            prompt_text: "Graphic poster design, bold stark swiss typography, duotone colors red and blue, retro aesthetic, minimalist composition, halftone dots --ar 2:3",
            ai_model: "Midjourney v6",
            image_url: "https://images.unsplash.com/photo-1517404215738-15263e9f9178?q=80&w=2800&auto=format&fit=crop",
            thumbnail_url: "https://images.unsplash.com/photo-1517404215738-15263e9f9178?q=80&w=800&auto=format&fit=crop",
            external_creator_name: "Armin AI",
            external_creator_handle: "@Arminn_Ai",
            external_creator_avatar_url: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=128&h=128&auto=format&fit=crop",
            external_post_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
            state: "published",
            visibility: "public",
            uploader_profile_id: uploaderProfileId,
            _categories: ["branding"],
            _tags: ["typographic", "retro"],
        }
    ];

    console.log("📤 Pushing items and taxonomies...");
    let successCount = 0;

    for (const item of premiumItems) {
        const categoriesToLink = item._categories.map((s) => getSlugId(categories, s)).filter(Boolean);
        const tagsToLink = item._tags.map((s) => getSlugId(tags, s)).filter(Boolean);

        delete item._categories;
        delete item._tags;

        // Insert Item
        const { data: insertedItem, error: insertErr } = await supabase
            .from("inspiration_items")
            .insert(item)
            .select("id")
            .single();

        if (insertErr) {
            console.error(`❌ Failed to insert item: ${item.title}`, insertErr);
            continue;
        }

        // Link Categories
        if (categoriesToLink.length > 0) {
            const catPayload = categoriesToLink.map((catId) => ({
                item_id: insertedItem.id,
                category_id: catId,
            }));
            await supabase.from("item_categories").insert(catPayload);
        }

        // Link Tags
        if (tagsToLink.length > 0) {
            const tagPayload = tagsToLink.map((tagId) => ({
                item_id: insertedItem.id,
                tag_id: tagId,
            }));
            await supabase.from("item_tags").insert(tagPayload);
        }

        successCount++;
    }

    console.log(`✅ Seed complete! Successfully added ${successCount}/${premiumItems.length} premium items.`);
}

main().catch(console.error);
