import { useSupabaseStore } from "@stores/supabase-store";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { useState } from "react";

async function signInWithAzure(supabase: SupabaseClient): Promise<void> {
    try {
        await supabase.auth.signInWithOAuth({
            provider: "azure", options: {
                redirectTo: window.location.href
            }
        });
    } catch (error) {
        console.error("Error signing in with Azure:", error);
    }
}

async function emailPasswordSignIn(supabase: SupabaseClient, email: string, password: string): Promise<void> {
    try {
        await supabase.auth.signInWithPassword({ email, password });
    } catch (error) {
        console.error("Error signing in with email and password:", error);
    }
}

interface UseAuthReturnType {
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
    getSession: () => Promise<Session | null>;
    // This can be any type of error, but for simplicity, we'll use unknown for now.
    // TODO: Properly type this.
    error: unknown;
}

export const useAuth = (): UseAuthReturnType => {
    const { supabase } = useSupabaseStore();
    const [authError, setAuthError] = useState<unknown>(null);

    const signIn = async (): Promise<void> => {
        if (!supabase) return;

        try {
            const env = process.env.APP_ENV; // Remember, use NEXT_PUBLIC_ prefix for environment variables in Next.js

            if (env === "production") {
                // Use OAuth for production
                await signInWithAzure(supabase);
            } else if (env === "development") {
                // Use email/password for development
                // Ideally, fetch these from environment variables
                const email = "example@example.com";
                const password = "password";

                await emailPasswordSignIn(supabase, email, password);
            } else {
                await signInWithAzure(supabase);
            }
        } catch (error) {
            console.error("Error during the sign-in process:", error);
            setAuthError(error);
        }
    };

    const signOut = async (): Promise<void> => {
        if (!supabase) return;

        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error("Error during the sign-out process:", error);
            setAuthError(error);
        }
    }

    const getSession = async (): Promise<Session | null> => {
        if (!supabase) {
            console.error("Supabase client is not initialized");
            return null;
        }

        try {
            const { data, error } = await supabase.auth.getSession();

            if (error) {
                console.error("Error fetching session data:", error);
                throw error;
            }

            return data.session;
        } catch (error) {
            console.error("Error fetching session data:", error);
            return null;
        }
    }

    // Returning the signIn function and any error that might have occurred
    return { signIn, signOut, getSession, error: authError };
};
