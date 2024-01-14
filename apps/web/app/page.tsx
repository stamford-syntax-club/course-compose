"use client";

import { Button, Flex, Grid, Paper, TextInput } from "@mantine/core";
import { IconFilter, IconSearch } from "@tabler/icons-react";

export default function HomePage(): JSX.Element {
	return (
		<Grid>
			<Grid.Col span={8}>
				<Flex direction="column" rowGap="md">
					<Flex direction="row" gap="md">
						<TextInput
							leftSection={<IconSearch className="size-4" />}
							className="w-full"
							placeholder="Search"
						/>
						<div className="flex flex-row gap-x-2">
							<Button variant="outline">
								<IconFilter className="size-4" aria-label="Filter" />
							</Button>
							{/* Adding a space here because without it, the text is weirdly clipped???? */}
							<Button variant="gradient" gradient={{ from: "blue", to: "cyan", deg: 90 }}>
								Search&nbsp;
							</Button>
						</div>
					</Flex>
					<Paper p="sm" withBorder>
						Thingy
					</Paper>
				</Flex>
			</Grid.Col>
			<Grid.Col span={4}>2</Grid.Col>
		</Grid>
	);
}
