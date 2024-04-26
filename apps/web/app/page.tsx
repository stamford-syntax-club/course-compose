"use client";

import { CourseCard } from "@components/ui/cards/course-card";
import { Button, Grid, Group, Menu, Pagination, Paper, Stack, Text, TextInput, rem } from "@mantine/core";
import {
	IconArrowsLeftRight,
	IconFilter,
	IconMessageCircle,
	IconPhoto,
	IconSearch,
	IconSettings,
	IconTrash
} from "@tabler/icons-react";
import { useState } from "react";

const COURSE_LIST = [
	{
		full_name: "Basic Mathematics",
		code: "MAT101",
		prerequisites: [],
		overall_ratings: 4.0,
		reviews_count: 20
	},
	{
		full_name: "Advanced Programming",
		code: "CSE302",
		prerequisites: ["CSE201", "CSE202"],
		overall_ratings: 4.5,
		reviews_count: 50
	},
	{
		full_name: "Modern Web Development",
		code: "WEB403",
		prerequisites: ["WEB301", "WEB302"],
		overall_ratings: 5.0,
		reviews_count: 150
	},
	{
		full_name: "Emerging Technologies",
		code: "TECH110",
		prerequisites: ["TECH100"],
		overall_ratings: 0,
		reviews_count: 0
	},
	{
		full_name: "Comprehensive Study of Theoretical and Applied Quantum Computing",
		code: "QTCMP999",
		prerequisites: ["QTCMP500", "PHY400"],
		overall_ratings: 3.8,
		reviews_count: 30
	},
	{
		full_name: "Introduction to Philosophy",
		code: "PHI101",
		prerequisites: ["PHI100"],
		overall_ratings: 2.0,
		reviews_count: 5
	},
	{
		full_name: "History & Culture: 1900's",
		code: "HIS200",
		prerequisites: ["HIS100"],
		overall_ratings: 3.5,
		reviews_count: 25
	}
];

export default function HomePage(): JSX.Element {
	const [currentSearch, setCurrentSearch] = useState("");

	const filteredCourses = currentSearch
		? COURSE_LIST.filter((course) => {
				return course.full_name.toLowerCase().includes(currentSearch.toLowerCase());
			})
		: COURSE_LIST;

	return (
		<Grid
			className="h-full"
			classNames={{
				inner: "h-full"
			}}
		>
			<Grid.Col span={{ base: 12, xl: 12 }}>
				<Stack className="h-full" gap="md">
					{/* Searchbar Container */}
					<form
						onSubmit={(e) => {
							e.preventDefault();
							const formData = new FormData(e.target as HTMLFormElement);
							setCurrentSearch(formData.get("course-searchbar") as string);
						}}
					>
						<Group wrap="nowrap" gap="xs">
							<TextInput
								name="course-searchbar"
								leftSection={<IconSearch className="size-4" />}
								className="w-full"
								placeholder="Search"
								onChange={(e) => {
									if (e.target.value === "") {
										setCurrentSearch("");
									}
								}}
							/>

							{/* Dropdown Menu for Filter */}
							<Menu shadow="md" width={200}>
								<Menu.Target>
									<Button type="button" variant="outline">
										<IconFilter className="size-4" aria-label="Filter" />
									</Button>
								</Menu.Target>

								<Menu.Dropdown>
									<Menu.Label>Filters</Menu.Label>
									<Menu.Item
										leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />}
									>
										Settings
									</Menu.Item>
									<Menu.Item
										leftSection={<IconMessageCircle style={{ width: rem(14), height: rem(14) }} />}
									>
										Messages
									</Menu.Item>
									<Menu.Item leftSection={<IconPhoto style={{ width: rem(14), height: rem(14) }} />}>
										Gallery
									</Menu.Item>
									<Menu.Item
										leftSection={<IconSearch style={{ width: rem(14), height: rem(14) }} />}
										rightSection={
											<Text size="xs" c="dimmed">
												⌘K
											</Text>
										}
									>
										Search
									</Menu.Item>

									<Menu.Divider />

									<Menu.Label>Danger zone</Menu.Label>
									<Menu.Item
										leftSection={
											<IconArrowsLeftRight style={{ width: rem(14), height: rem(14) }} />
										}
									>
										Transfer my data
									</Menu.Item>
									<Menu.Item
										color="red"
										leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
									>
										Delete my account
									</Menu.Item>
								</Menu.Dropdown>
							</Menu>

							{/* Search Button */}
							<Button type="submit">
								<IconSearch className="size-4" aria-label="Filter" />
							</Button>
						</Group>
					</form>

					{/* Courses List Body */}
					<Paper bg="dark.8" p="sm" withBorder className="h-full">
						<div className="relative flex size-full flex-col">
							<div className="grid grid-cols-12 grid-rows-3 gap-4">
								{filteredCourses.map((course) => {
									return (
										<CourseCard
											// Ensure that the key is unique, otherwise same keys will cause a lot of issues.
											key={`CourseCard_${course.code}`}
											full_name={course.full_name}
											code={course.code}
											prerequisites={course.prerequisites}
											overall_ratings={course.overall_ratings}
											reviews_count={course.reviews_count}
										/>
									);
								})}
							</div>

							<div className="mt-auto flex items-center justify-center">
								<Pagination withEdges total={10} />
							</div>
						</div>
					</Paper>
				</Stack>
			</Grid.Col>

			{/* Review Feed */}
			{/* <Grid.Col visibleFrom="xl" span={2}>
				<Paper bg="dark.8" p="sm" withBorder className="h-full">
					Lol
				</Paper>
			</Grid.Col> */}
		</Grid>
	);
}
