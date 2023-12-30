"use client";

import { AppShell, Burger, Group } from "@mantine/core";

export default function ApplicationHeader({ opened, toggle }: { opened: boolean; toggle: () => void }): JSX.Element {
	return (
		<AppShell.Header>
			<Group h="100%" px="md">
				<Burger onClick={toggle} opened={opened} size="lg" />
				{/* <MantineLogo size={30} /> */}
			</Group>
		</AppShell.Header>
	);
}
