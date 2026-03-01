import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Using Service Role to bypass RLS for seeding

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    const { data: workspaces } = await supabase.from('workspaces').select('id').limit(1);
    if (!workspaces || workspaces.length === 0) {
        console.log("No workspaces found.");
        return;
    }

    const workspaceId = workspaces[0].id;

    const templates = [
        {
            workspace_id: workspaceId,
            name: "Holographic Glass UI Elements",
            description: "A set of futuristic, transparent glassmorphic UI cards floating in a dark environment with neon purple accents.",
            is_public: true,
            source_url: "https://twitter.com/design_inspo/123"
        },
        {
            workspace_id: workspaceId,
            name: "Matte Black Headphones - Commercial Shot",
            description: "High-end product photography of matte black over-ear headphones on a textured dark graphite surface.",
            is_public: true,
            source_url: "https://dribbble.com/shots/456"
        },
        {
            workspace_id: workspaceId,
            name: "Ethereal Fashion Portrait",
            description: "Fashion editorial of a model wearing iridescent translucent fabrics in a minimalist concrete studio.",
            is_public: true,
            source_url: "https://instagram.com/p/789"
        }
    ];

    const { error } = await supabase.from('prompt_templates').insert(templates);

    if (error) {
        console.error("Error inserting templates:", error);
    } else {
        console.log("Successfully seeded 3 public prompt templates.");
    }
}

seed();
