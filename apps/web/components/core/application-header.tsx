"use client";

import { AppShell, Burger, Group } from "@mantine/core";
import Link from "next/link";

export default function ApplicationHeader({ opened, toggle }: { opened: boolean; toggle: () => void }): JSX.Element {
	return (
		<AppShell.Header>
			<Group h="100%" px="md">
				<Burger onClick={toggle} opened={opened} size="lg" />
				<div>
					<Link href="/">
						<span className="select-none text-3xl font-bold uppercase">Course Compose</span>
					</Link>
				</div>
				{/* <MantineLogo size={30} /> */}
			</Group>
		</AppShell.Header>
	);
}
