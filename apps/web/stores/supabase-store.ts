import type { SupabaseClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from 'lib/supabase/component';
import { create } from 'zustand';

const supabase = createClient();

interface SupabaseState {
    supabase: SupabaseClient<any, "public", any> | null;
};

export const useSupabaseStore = create<SupabaseState>((set) => ({
    supabase,
}));