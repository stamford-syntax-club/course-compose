"use client";

import { Button, Flex, Grid, Paper, TextInput } from "@mantine/core";
import { IconFilter, IconSearch } from "@tabler/icons-react";

export default function HomePage(): JSX.Element {
	return (
		<Grid>
			<Grid.Col span={{ base: 12, lg: 8 }}>
				<Flex direction="column" rowGap="md">
					<Flex direction="row" gap="xs">
						<TextInput
							leftSection={<IconSearch className="size-4" />}
							className="w-full"
							placeholder="Search"
						/>
						<Button variant="outline">
							<IconFilter className="size-4" aria-label="Filter" />
						</Button>
						<Button>
							<IconSearch className="size-4" aria-label="Filter" />
						</Button>
					</Flex>
					<Paper p="sm" withBorder>
						<Grid>
							<Grid.Col span={{ base: 6, lg: 4 }}>1</Grid.Col>
							<Grid.Col span={4}>2</Grid.Col>
							<Grid.Col span={4}>3</Grid.Col>
						</Grid>
					</Paper>
				</Flex>
			</Grid.Col>
			<Grid.Col span={4}>2</Grid.Col>
		</Grid>
	);
}
