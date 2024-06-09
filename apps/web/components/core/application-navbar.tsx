"use client";
import { AppShell, Button, Flex, NavLink, Stack } from "@mantine/core";
import { useAuth } from "hooks/use-auth";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { IconBooks, IconHistory, IconHome, IconCheckbox } from "@tabler/icons-react";
import SigninConfirmationModal from "@components/ui/signin-confirmation";

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
		label: "Resources",
		href: "https://center.stamford.dev/resources",
		newTab: true,
		icon: <IconBooks />
	},
	{
		label: "Guidelines",
		href: "/guidelines",
		newTab: true,
		icon: <IconCheckbox />
	}
];

export default function ApplicationNavbar({ opened, toggle }: { opened: boolean; toggle: () => void }): JSX.Element {
	const { signOut, working, getSession } = useAuth();
	const [signedIn, setSignedIn] = useState(false);
	const [openedSignInConfirmation, { open: openConfirmation, close: closeConfirmation }] = useDisclosure(false);

	useEffect(() => {
		getSession()
			.then((session) => {
				if (session) {
					setSignedIn(true);
				}
			})
			.catch(console.error);
	}, [getSession]);

	return (
		<AppShell.Navbar p="md" hidden={!opened}>
			<Stack h="100%" gap="xs">
				{navItems.map((item, index) => {
					console.log(item.href, window.location.pathname)
					return (
						<Flex key={`navitem-${item.label}`} direction="row" align="center">
							<NavLink
								className="rounded-md"
								label={item.label.toUpperCase()}
								onClick={(e) => {	
									if (item.href === window.location.pathname) {
										e.preventDefault();
										window.location.href = item.href;
									} else toggle();
								}}
								href={item.href}
								target={item.newTab ? "_blank" : "_self"}
								component={Link}
								leftSection={item.icon}
							/>
						</Flex>
					);
				})}

				<Flex className="mt-auto">
					{signedIn ? (
						<Button
							color="red"
							className="w-full"
							onClick={() => {
								signOut().catch(console.error);
							}}
						>
							Sign Out
						</Button>
					) : (
						<Button
							disabled={working}
							variant="default"
							onClick={openConfirmation}
							className="w-full select-none text-lg font-bold uppercase"
						>
							Sign In
						</Button>
					)}
					<SigninConfirmationModal opened={openedSignInConfirmation} close={closeConfirmation} />
				</Flex>
			</Stack>
		</AppShell.Navbar>
	);
}
