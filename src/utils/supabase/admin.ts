import { createClient } from "@supabase/supabase-js";

// WARNING: This client uses the SERVICE ROLE KEY. 
// It bypasses all Row Level Security (RLS) policies.
// NEVER import or use this client in any client-side components.
// Only use it in strict Admin-only Server Actions or isolated scripts.

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase Service Role environment variables.");
}

export const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);
