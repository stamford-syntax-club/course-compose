"use client";

import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { createClient } from "lib/supabase/component";
import { useEffect, useState } from "react";
import ApplicationHeader from "./application-header";
import ApplicationNavbar from "./application-navbar";

export function ApplicationShell({ children }: { children: React.ReactNode }): JSX.Element {
	const [opened, { toggle }] = useDisclosure();

	const supabase = createClient();

	// TODO: share this state in a global state
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	useEffect(() => {
		const { data } = supabase.auth.onAuthStateChange((event, session) => {
			console.log(event, session);
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
	}, [supabase.auth]);

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
			<ApplicationHeader opened={opened} toggle={toggle} supabase={supabase} isLoggedIn={isLoggedIn} />
			<ApplicationNavbar />

			{/* TODO: Make this not stupid  Lets you use 100% height for the main content (?) */}
			<AppShell.Main className="h-dvh">{children}</AppShell.Main>
		</AppShell>
	);
}
