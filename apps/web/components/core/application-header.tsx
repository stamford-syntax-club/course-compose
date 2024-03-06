import { AppShell, Avatar, Burger, Button, Group, Menu } from "@mantine/core";
import { useSupabaseStore } from "@stores/supabase-store";
import type { Session } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ApplicationHeaderProps {
	opened: boolean;
	toggle: () => void;
}

// Assuming proper typing for SupabaseClient is completed outside this snippet
export default function ApplicationHeader({ opened, toggle }: ApplicationHeaderProps): JSX.Element {
	const [sessionData, setSessionData] = useState<Session | null>(null);
	const { supabase, isLoggedIn } = useSupabaseStore();

	const [working, setWorking] = useState(false);

	useEffect(() => {
		const fetchSession = async (): Promise<void> => {
			if (!supabase?.auth) return;

			try {
				const {
					data: { session }
				} = await supabase.auth.getSession();
				setSessionData(session);
			} catch (error) {
				console.error(error);
			}
		};

		fetchSession().catch(console.error);
	}, [supabase]);

	const signOut = async (): Promise<void> => {
		if (!supabase?.auth) return;

		try {
			await supabase.auth.signOut();
		} catch (error) {
			console.error(error);
		}
	};

	const signInWithAzure = async (): Promise<void> => {
		if (!supabase?.auth) return;

		try {
			const result = await supabase.auth.signInWithOAuth({ provider: "azure" });
		} catch (error) {
			console.error(error);
		}
	};

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

		signInWithAzure()
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
					<span className="cursor-pointer select-none text-3xl font-bold uppercase">Course Compose</span>
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
									{sessionData?.user.email ? sessionData.user.email.split("@")[0] : "No email"}
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
