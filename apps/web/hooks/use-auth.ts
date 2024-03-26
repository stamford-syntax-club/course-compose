import { useSupabaseStore } from "@stores/supabase-store";
import type { Session, SupabaseClient } from "@supabase/supabase-js";

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
}

export const useAuth = (): UseAuthReturnType => {
    const { supabase } = useSupabaseStore();

    const signIn = async (): Promise<void> => {
        if (!supabase) return;

        try {
            // TODO: Implement a proper way to use email/password in beta
            // const env = process.env.NEXT_PUBLIC_APP_ENV;

            // if (env === "production") {
            //     // Use OAuth for production
            //     await signInWithAzure(supabase);
            // } else {
            //     // Use email/password for development
            //     // Ideally, fetch these from environment variables
            //     const email = "example@example.com";
            //     const password = "password";

            //     await emailPasswordSignIn(supabase, email, password);
            // }

            await signInWithAzure(supabase);

        } catch (error) {
            console.error("Error during the sign-in process:", error);
        }
    };

    const signOut = async (): Promise<void> => {
        if (!supabase) return;

        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error("Error during the sign-out process:", error);
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
    return { signIn, signOut, getSession };
};
