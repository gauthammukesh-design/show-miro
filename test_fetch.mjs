import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase
        .from('prompt_templates')
        .select('id, name, is_public');

    console.log("Anon Fetch Data:", data);
    console.log("Anon Fetch Error:", error);
}

check();
