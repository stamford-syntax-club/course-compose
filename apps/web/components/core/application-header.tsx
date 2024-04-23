import { AppShell, Avatar, Burger, Button, Group, Menu } from "@mantine/core";
import { useSupabaseStore } from "@stores/supabase-store";
import { useAuth } from "hooks/use-auth";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { Session } from "@supabase/supabase-js";

interface ApplicationHeaderProps {
	opened: boolean;
	toggle: () => void;
}

// Assuming proper typing for SupabaseClient is completed outside this snippet
export default function ApplicationHeader({ opened, toggle }: ApplicationHeaderProps): JSX.Element {
	const { signIn, signOut, getSession } = useAuth();
	const { supabase } = useSupabaseStore();
	const [sessionData, setSessionData] = useState<Session>();

	const [working, setWorking] = useState(false);

	useEffect(() => {
		getSession()
			.then((session) => {
				if (!session) return;
				setSessionData(session);
			})
			.catch(console.error);

		if (!supabase) return;

		const eventListener = supabase.auth.onAuthStateChange((event, session) => {
			if (event === "SIGNED_IN" && session) {
				setSessionData(session);
			} else if (event === "SIGNED_OUT") {
				setSessionData(undefined);
			}
		});

		return () => {
			eventListener.data.subscription.unsubscribe();
		};
	}, [getSession, supabase]);

	const isLoggedIn = sessionData?.user !== undefined;

	const handleSignOut = (): void => {
		if (working) return;
		setWorking(true);

		signOut()
			.catch(console.error)
			.finally(() => {
				setWorking(false);
			});
	};

	// TODO: better anti-spam functionality. signInWithOAuth resolves very quickly and can be spammed.. for some reason.
	const handleSignInWithAzure = (): void => {
		if (working) return;
		setWorking(true);

		signIn()
			.catch(console.error)
			.finally(() => {
				setWorking(false);
			});
	};

	return (
		<AppShell.Header>
			<Group h="100%" px="md">
				<Burger onClick={toggle} opened={opened} size="lg" />
				<Link href="/">
					<span className="cursor-pointer select-none text-lg lg:text-3xl font-bold uppercase cursor-pointer select-none">Course Compose</span>
				</Link>
				<div className="ml-auto">
					{isLoggedIn ? (
						<Menu shadow="md" withArrow arrowPosition="center" position="left-start">
							<Menu.Target>
								<Avatar alt="profile picture" />
							</Menu.Target>
							<Menu.Dropdown>
								<Menu.Label>Logged in as</Menu.Label>
								<Menu.Item disabled>
									{sessionData.user.email ? sessionData.user.email.split("@")[0] : "No email"}
								</Menu.Item>
								<Menu.Label>Actions</Menu.Label>
								<Button disabled={working} className="w-full" color="red" onClick={handleSignOut}>
									Sign Out
								</Button>
							</Menu.Dropdown>
						</Menu>
					) : (
						<Button
							disabled={working}
							variant="default"
							onClick={handleSignInWithAzure}
							className="select-none text-lg font-bold uppercase"
						>
							Sign In
						</Button>
					)}
				</div>
			</Group>
		</AppShell.Header>
	);
}
