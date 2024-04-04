"use client";
import { AppShell, Button, Flex, NavLink, Stack } from "@mantine/core";
import { navItems } from "@utils/navitems";
import { useAuth } from "hooks/use-auth";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ApplicationNavbar(): JSX.Element {
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
		<AppShell.Navbar p="md">
			<Stack h="100%" gap="xs">
				{navItems.map((item, index) => {
					return (
						<NavLink
							className="rounded-md"
							label={item.label.toUpperCase()}
							href={item.href}
							key={`navitem-${item.label}`}
							component={Link}
						/>
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
							className="hidden w-full select-none text-lg font-bold uppercase md:block"
						>
							Sign In
						</Button>
					)}
				</Flex>
			</Stack>
		</AppShell.Navbar>
	);
}
