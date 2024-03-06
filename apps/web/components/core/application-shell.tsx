"use client";

import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useSupabaseStore } from "@stores/supabase-store";
import { createClient } from "lib/supabase/component";
import { useEffect } from "react";
import ApplicationHeader from "./application-header";
import ApplicationNavbar from "./application-navbar";

export function ApplicationShell({ children }: { children: React.ReactNode }): JSX.Element {
	const [opened, { toggle }] = useDisclosure();

	const { setSupabase, setIsLoggedIn } = useSupabaseStore();

	const supabase = createClient();

	useEffect(() => {
		setSupabase(supabase);

		const { data } = supabase.auth.onAuthStateChange((event, session) => {
			setIsLoggedIn(session !== null);
		});

		supabase.auth
			.getSession()
			.then((session) => {
				setIsLoggedIn(session.data.session !== null);
			})
			.catch((error) => {
				console.error(error);
			});

		return () => {
			// call unsubscribe to remove the callback
			data.subscription.unsubscribe();
		};
	}, [supabase, supabase.auth, setSupabase, setIsLoggedIn]);

	return (
		<AppShell
			header={{ height: 60 }}
			navbar={{
				width: 300,
				breakpoint: "sm",
				collapsed: { mobile: !opened, desktop: !opened }
			}}
			padding="md"
		>
			<ApplicationHeader opened={opened} toggle={toggle} />
			<ApplicationNavbar />

			{/* TODO: Make this not stupid  Lets you use 100% height for the main content (?) */}
			<AppShell.Main className="h-dvh">{children}</AppShell.Main>
		</AppShell>
	);
}
