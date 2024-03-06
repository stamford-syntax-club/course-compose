import type { SupabaseClient } from '@supabase/auth-helpers-nextjs';
import { create } from 'zustand';

interface SupabaseState {
    supabase: SupabaseClient<any, "public", any> | null;
    isLoggedIn: boolean;
    setSupabase: (supabase: SupabaseClient<any, "public", any>) => void; // TODO: properly type this
    setIsLoggedIn: (isLoggedIn: boolean) => void;
};

export const useSupabaseStore = create<SupabaseState>((set) => ({
    supabase: null,
    isLoggedIn: false,
    setIsLoggedIn: (isLoggedIn) => { set({ isLoggedIn }) },
    setSupabase: (supabase) => { set({ supabase }) },
}));