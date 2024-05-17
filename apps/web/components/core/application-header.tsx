import { AppShell, Avatar, Burger, Button, Group, Menu } from "@mantine/core";
import { useSupabaseStore } from "@stores/supabase-store";
import { useAuth } from "hooks/use-auth";
import Link from "next/link";
import { useEffect, useState } from "react";
import { navItems } from "./application-navbar";
import { useDisclosure } from "@mantine/hooks";
import type { Session } from "@supabase/supabase-js";
import SigninConfirmationModal from "@components/ui/signin-confirmation";

interface ApplicationHeaderProps {
	opened: boolean;
	toggle: () => void;
}

// Assuming proper typing for SupabaseClient is completed outside this snippet
export default function ApplicationHeader({ opened, toggle }: ApplicationHeaderProps): JSX.Element {
	const { signOut, getSession, working } = useAuth();
	const { supabase } = useSupabaseStore();
	const [sessionData, setSessionData] = useState<Session>();
	const [openedSignInConfirmation, { open: openConfirmation, close: closeConfirmation }] = useDisclosure(false);

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

	return (
		<AppShell.Header>
			<Group h="100%" px="md">
				<Burger onClick={toggle} opened={opened} size="lg" />
				<Link href="/">
					<span className="hidden cursor-pointer select-none text-2xl font-bold uppercase sm:block">
						Course Compose
					</span>
				</Link>

				<div className="hidden cursor-pointer select-none flex-row gap-x-4 sm:flex">
					{navItems.map((item, index) => {
						return (
							<Link
								target={item.newTab ? "_blank" : undefined}
								href={item.href}
								key={`navitem-${item.label}`}
							>
								{item.label.toUpperCase()}
							</Link>
						);
					})}
				</div>

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
								<Button disabled={working} className="w-full" color="red" onClick={signOut}>
									Sign Out
								</Button>
							</Menu.Dropdown>
						</Menu>
					) : (
						<Button
							disabled={working}
							variant="default"
							onClick={openConfirmation}
							className="select-none text-lg font-bold uppercase"
						>
							Sign In
						</Button>
					)}
					<SigninConfirmationModal opened={openedSignInConfirmation} close={closeConfirmation} />
				</div>
			</Group>
		</AppShell.Header>
	);
}
