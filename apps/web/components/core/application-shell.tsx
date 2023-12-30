"use client";

import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import ApplicationHeader from "./application-header";
import ApplicationNavbar from "./application-navbar";

export function ApplicationShell({ children }: { children: React.ReactNode }): JSX.Element {
	const [opened, { toggle }] = useDisclosure();

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

			<AppShell.Main>{children}</AppShell.Main>
		</AppShell>
	);
}
