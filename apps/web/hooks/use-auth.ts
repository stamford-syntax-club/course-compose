import { useSupabaseStore } from "@stores/supabase-store";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

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
    // This can be any type of error, but for simplicity, we'll use unknown for now.
    // TODO: Properly type this.
    error: unknown;
}

export const useAuth = (): UseAuthReturnType => {
    const { supabase } = useSupabaseStore();
    const [authError, setAuthError] = useState<unknown>(null);

    useEffect(() => {
        if (!supabase) {
            console.error("Supabase client is not initialized");
            setAuthError(new Error("Supabase client is not initialized"));
        }
    }, [supabase]);

    const signIn = async (): Promise<void> => {
        if (!supabase) return;

        try {
            const env = process.env.APP_ENV; // Use NEXT_PUBLIC_ prefix for environment variables in Next.js

            if (env === "production") {
                // Use OAuth for production
                await signInWithAzure(supabase);
            } else {
                // Ideally, fetch these from environment variables
                const email = "example@example.com";
                const password = "password";
                await emailPasswordSignIn(supabase, email, password);
            }
        } catch (error) {
            console.error("Error during the sign-in process:", error);
            setAuthError(error);
        }
    };

    // Returning the signIn function and any error that might have occurred
    return { signIn, error: authError };
};
