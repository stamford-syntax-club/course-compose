import type { SupabaseClient } from '@supabase/auth-helpers-nextjs';
import { create } from 'zustand';

interface SupabaseState {
    supabase: SupabaseClient<any, "public", any> | null;
    setSupabase: (supabase: SupabaseClient<any, "public", any>) => void; // TODO: properly type this
};

export const useSupabaseStore = create<SupabaseState>((set) => ({
    supabase: null,
    setSupabase: (supabase) => { set({ supabase }) },
}));