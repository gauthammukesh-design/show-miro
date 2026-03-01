import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    const { data: workspaces } = await supabase.from('workspaces').select('id').limit(1);
    if (!workspaces || workspaces.length === 0) return;
    const workspaceId = workspaces[0].id;

    const templates = [
        {
            workspace_id: workspaceId,
            name: "Cyberpunk Neon Car",
            description: "A futuristic neon-lit car zooming through a rainy cyberpunk city street.",
            is_public: true,
            source_url: "https://twitter.com/inspo/1"
        },
        {
            workspace_id: workspaceId,
            name: "Minimalist Scandinavian Interior",
            description: "Clean, bright living room with wooden furniture and plants. High-end architectural photography.",
            is_public: true,
            source_url: "https://dribbble.com/shots/2"
        },
        {
            workspace_id: workspaceId,
            name: "Vibrant Conceptual Art",
            description: "Abstract 3D shapes floating in a vibrant colorful void. Studio lighting.",
            is_public: true,
            source_url: "https://instagram.com/p/3"
        },
        {
            workspace_id: workspaceId,
            name: "Moody Culinary Portrait",
            description: "Dark moody food photography of an artisanal burger with sharp focus.",
            is_public: true,
            source_url: "https://pinterest.com/pin/4"
        },
        {
            workspace_id: workspaceId,
            name: "Tactical Tech Gadget",
            description: "Exploded view of a modern smartwatch showing all components floating in mid-air.",
            is_public: true,
            source_url: "https://twitter.com/tech/5"
        },
        {
            workspace_id: workspaceId,
            name: "Serene Nature Landscape",
            description: "Foggy mountains at sunrise with deep green forests.",
            is_public: true,
            source_url: "https://unsplash.com/photos/6"
        },
        {
            workspace_id: workspaceId,
            name: "Macro Floral Aesthetics",
            description: "Extreme close-up of a blooming exotic flower with water droplets.",
            is_public: true,
            source_url: "https://instagram.com/p/7"
        },
        {
            workspace_id: workspaceId,
            name: "Elegant UI Dashboard",
            description: "A dark-mode analytics dashboard with glassmorphic charts and glowing financial indicators.",
            is_public: true,
            source_url: "https://dribbble.com/shots/8"
        }
    ];

    const { error } = await supabase.from('prompt_templates').insert(templates);
    if (error) console.error("Error:", error);
    else console.log("Seeded 8 cards.");
}

seed();
