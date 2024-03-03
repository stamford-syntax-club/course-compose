"use client";

import { AppShell, Avatar, Burger, Button, Group, Menu } from "@mantine/core";
import type { Session, SupabaseClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ApplicationHeaderProps {
	opened: boolean;
	toggle: () => void;
	supabase: SupabaseClient<any, "public", any>; // TODO: properly type this (2x)
	isLoggedIn: boolean;
}

export default function ApplicationHeader({
	opened,
	toggle,
	supabase,
	isLoggedIn
}: ApplicationHeaderProps): JSX.Element {
	const [sessionData, setSessionData] = useState<Session | null>(null);

	// TODO: share this state in a global state
	useEffect(() => {
		supabase.auth
			.getSession()
			.then((session) => {
				setSessionData(session.data.session !== null ? session.data.session : null);
			})
			.catch((error) => {
				console.error(error);
			});
	}, [supabase.auth]);

	return (
		<AppShell.Header>
			<Group h="100%" px="md">
				<Burger onClick={toggle} opened={opened} size="lg" />
				<div>
					<Link href="/">
						<span className="select-none text-3xl font-bold uppercase">Course Compose</span>
					</Link>
				</div>

				{isLoggedIn ? (
					<div className="ml-auto">
						<Menu shadow="md" withArrow arrowPosition="center" position="left-start">
							<Menu.Target>
								<Avatar alt="profile picture" />
							</Menu.Target>

							<Menu.Dropdown>
								<Menu.Label>Logged in as</Menu.Label>
								<Menu.Item disabled className="text-white">
									{/* TODO: Fix ESLint complaining. Later. */}
									{sessionData?.user?.email ? sessionData.user.email.split("@")[0] : "No email"}
								</Menu.Item>
								<Menu.Label>Actions</Menu.Label>
								<Button
									className="w-full"
									color="red"
									onClick={() => {
										supabase.auth
											.signOut()
											.then(() => {
												console.log("Signed out");
											})
											.catch((error) => {
												console.error(error);
											});
									}}
								>
									Sign Out
								</Button>
							</Menu.Dropdown>
						</Menu>
					</div>
				) : (
					<div>
						<Button
							variant="default"
							onClick={() => {
								supabase.auth
									.signInWithOAuth({ provider: "azure" })
									.then((result) => {
										console.log("OAuth result", result.data);
									})
									.catch((error) => {
										console.error(error);
									});
							}}
							className="select-none text-lg font-bold uppercase"
						>
							Sign In
						</Button>
					</div>
				)}
			</Group>
		</AppShell.Header>
	);
}
