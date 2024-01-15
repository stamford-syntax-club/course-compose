"use client";

import { AppShell, Burger, Group, Switch, useComputedColorScheme, useMantineColorScheme } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";
import Link from "next/link";

export default function ApplicationHeader({ opened, toggle }: { opened: boolean; toggle: () => void }): JSX.Element {
	const { setColorScheme } = useMantineColorScheme({
		keepTransitions: true
	});
	const colorScheme = useComputedColorScheme("dark");

	return (
		<AppShell.Header>
			<Group h="100%" px="md">
				<Burger onClick={toggle} opened={opened} size="lg" />
				<div>
					<Link href="/">
						<span className="select-none text-3xl font-bold uppercase">Course Compose</span>
					</Link>
				</div>

				<div className="ml-auto">
					<Switch
						onChange={(_) => {
							setColorScheme(colorScheme === "dark" ? "light" : "dark");
						}}
						checked={colorScheme === "dark"}
						size="md"
						color="dark.4"
						offLabel={<IconSun className="size-4" />}
						onLabel={<IconMoon className="size-4" />}
					/>
				</div>
			</Group>
		</AppShell.Header>
	);
}
