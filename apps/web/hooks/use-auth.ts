import { useSupabaseStore } from "@stores/supabase-store";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useState } from "react";

async function signInWithAzure(supabase: SupabaseClient): Promise<void> {
	try {
		await supabase.auth.signInWithOAuth({
			provider: "azure",
			options: {
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
	signIn: (email?: string, password?: string) => Promise<void>;
	signUp: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
	working: boolean;
	getSession: () => Promise<Session | null>;
}

export const useAuth = (): UseAuthReturnType => {
	const { supabase } = useSupabaseStore();

	const [working, setWorking] = useState(false);

	const signIn = useCallback(
		async (email?: string, password?: string): Promise<void> => {
			if (!supabase) return;
			if (working) return;

			try {
				setWorking(true);
				const env = process.env.NEXT_PUBLIC_APP_ENV;
				if (env === "production") {
					await signInWithAzure(supabase);
					return;
				}

				if (!email || !password) {
					throw new Error("email or password is missing to login");
				}

				await emailPasswordSignIn(supabase, email, password);
			} catch (error) {
				console.error("Error during the sign-in process:", error);
			} finally {
				setWorking(false);
			}
		},
		[supabase]
	);

	const signUp = useCallback(
		async (email: string, password: string): Promise<void> => {
			if (!supabase) return;
			if (working) return;

			try {
				setWorking(true);
				await supabase.auth.signUp({
					email,
					password
				});
			} catch (error) {
				console.error("Error during sign-up process:", error);
			} finally {
				setWorking(false);
			}
		},
		[supabase]
	);

	const signOut = useCallback(async (): Promise<void> => {
		if (!supabase) return;
		if (working) return;

		try {
			setWorking(true);
			await supabase.auth.signOut();
		} catch (error) {
			console.error("Error during the sign-out process:", error);
		} finally {
			setWorking(false);
			window.location.reload();
		}
	}, [supabase]);

	const getSession = useCallback(async (): Promise<Session | null> => {
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
	}, [supabase]);

	// Returning the signIn function and any error that might have occurred
	return { signIn, signUp, signOut, working, getSession };
};
