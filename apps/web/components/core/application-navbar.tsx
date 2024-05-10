"use client";
import { AppShell, Button, Flex, NavLink, Stack } from "@mantine/core";
import { useAuth } from "hooks/use-auth";
import Link from "next/link";
import { useEffect, useState } from "react";

import { IconBooks, IconHistory, IconHome } from "@tabler/icons-react";
export const navItems = [
	{
		label: "Home",
		href: "/",
		icon: <IconHome />
	},
	{
		label: "My Reviews",
		href: "/my-reviews",
		icon: <IconHistory />
	},
	{
		label: "Resource Hub",
		href: "https://center.stamford.dev/resources",
		newTab: true,
		icon: <IconBooks />
	}
];

export default function ApplicationNavbar({ opened, toggle }: { opened: boolean; toggle: () => void }): JSX.Element {
	const { signIn, signOut, getSession } = useAuth();
	const [working, setWorking] = useState(false);
	const [signedIn, setSignedIn] = useState(false);

	useEffect(() => {
		getSession()
			.then((session) => {
				if (session) {
					setSignedIn(true);
				}
			})
			.catch(console.error);
	}, [getSession]);

	// TODO: This is code duplicated with application-header.tsx, should be refactored into a hook
	const handleSignInWithAzure = (): void => {
		if (working) return;
		setWorking(true);

		signIn()
			.catch(console.error)
			.finally(() => {
				setWorking(false);
			});
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

	return (
		<AppShell.Navbar p="md" hidden={!opened}>
			<Stack h="100%" gap="xs">
				{navItems.map((item, index) => {
					return (
						<Flex key={`navitem-${item.label}`} direction="row" align="center">
							<NavLink
								className="rounded-md"
								label={item.label.toUpperCase()}
								onClick={toggle}
								href={item.href}
								target={item.newTab ? "_blank" : undefined}
								component={Link}
								leftSection={item.icon}
							/>
						</Flex>
					);
				})}

				<Flex className="mt-auto">
					{signedIn ? (
						<Button color="red" className="w-full" onClick={handleSignOut}>
							Sign Out
						</Button>
					) : (
						<Button
							disabled={working}
							variant="default"
							onClick={handleSignInWithAzure}
							className="w-full select-none text-lg font-bold uppercase"
						>
							Sign In
						</Button>
					)}
				</Flex>
			</Stack>
		</AppShell.Navbar>
	);
}
