"use client";

import { CourseCard } from "@components/ui/course-card";
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
		courseName: "Basic Mathematics",
		courseCode: "MAT101",
		coursePrerequisites: [],
		courseRating: 4.0,
		courseReviewCount: 20
	},
	{
		courseName: "Advanced Programming",
		courseCode: "CSE302",
		coursePrerequisites: ["CSE201", "CSE202"],
		courseRating: 4.5,
		courseReviewCount: 50
	},
	{
		courseName: "Modern Web Development",
		courseCode: "WEB403",
		coursePrerequisites: ["WEB301", "WEB302"],
		courseRating: 5.0,
		courseReviewCount: 150
	},
	{
		courseName: "Emerging Technologies",
		courseCode: "TECH110",
		coursePrerequisites: ["TECH100"],
		courseRating: 0,
		courseReviewCount: 0
	},
	{
		courseName: "Comprehensive Study of Theoretical and Applied Quantum Computing",
		courseCode: "QTCMP999",
		coursePrerequisites: ["QTCMP500", "PHY400"],
		courseRating: 3.8,
		courseReviewCount: 30
	},
	{
		courseName: "Introduction to Philosophy",
		courseCode: "PHI101",
		coursePrerequisites: ["PHI100"],
		courseRating: 2.0,
		courseReviewCount: 5
	},
	{
		courseName: "History & Culture: 1900's",
		courseCode: "HIS200",
		coursePrerequisites: ["HIS100"],
		courseRating: 3.5,
		courseReviewCount: 25
	}
];

export default function HomePage(): JSX.Element {
	const [currentSearch, setCurrentSearch] = useState("");

	const filteredCourses = currentSearch
		? COURSE_LIST.filter((course) => {
				return course.courseName.toLowerCase().includes(currentSearch.toLowerCase());
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
											key={`CourseCard_${course.courseCode}`}
											courseName={course.courseName}
											courseCode={course.courseCode}
											coursePrerequisites={course.coursePrerequisites}
											courseRating={course.courseRating}
											courseReviewCount={course.courseReviewCount}
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
