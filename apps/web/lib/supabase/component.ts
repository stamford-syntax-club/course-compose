import type { SupabaseClient } from '@supabase/auth-helpers-nextjs'
import { createBrowserClient } from '@supabase/ssr'

// TODO: properly type this
export function createClient(): SupabaseClient<any, "public", any> {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    return supabase
}