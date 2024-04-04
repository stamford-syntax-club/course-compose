"use client";

import { CourseCard } from "@components/ui/course-card";
import {
	Button,
	Grid,
	Group,
	Menu,
	Pagination,
	Paper,
	Stack,
	Text,
	TextInput,
	Container,
	rem,
	Slider
} from "@mantine/core";
import { IconSortAscending, IconSortAscendingNumbers, IconSortDescendingNumbers } from "@tabler/icons-react";
import {
	IconFileDescription,
	IconFilter,
	IconReload,
	IconSearch,
	IconSortDescending,
	IconStarFilled
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
	const [value, setValue] = useState(0);
	const [endValue, setEndValue] = useState(200);

	const filteredCourses = currentSearch
		? COURSE_LIST.filter((course) => {
				const COURSE_NAME_MATCH = course.courseName.toLowerCase().includes(currentSearch.toLowerCase());
				const COURSE_CODE_MATCH = course.courseCode.toLowerCase().includes(currentSearch.toLowerCase());
				const COURSE_PREREQUISITES_MATCH = course.coursePrerequisites.some((prerequisite) =>
					prerequisite.toLowerCase().includes(currentSearch.toLowerCase())
				);

				return COURSE_NAME_MATCH || COURSE_CODE_MATCH || COURSE_PREREQUISITES_MATCH;
				// return course.courseName.toLowerCase().includes(currentSearch.toLowerCase());
			})
		: COURSE_LIST;

	return (
		<Container fluid>
			{/*	<Grid.Col span={{ base: 12, xl: 10 }}> */}
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
								<Menu.Label>Filters by ratings</Menu.Label>
								<Menu.Item leftSection={<IconStarFilled style={{ width: rem(14), height: rem(14) }} />}>
									<Text className="flex items-center justify-between">
										<span>High to Low</span>
										<IconSortDescending style={{ width: rem(18), height: rem(18) }} />
									</Text>
								</Menu.Item>
								<Menu.Item leftSection={<IconStarFilled style={{ width: rem(14), height: rem(14) }} />}>
									<Text className="flex items-center justify-between">
										<span>Low to High</span>
										<IconSortAscending style={{ width: rem(18), height: rem(18) }} />
									</Text>
								</Menu.Item>

								<Menu.Divider />

								<Menu.Label>Filter by review count</Menu.Label>
								<Menu.Item
									leftSection={<IconFileDescription style={{ width: rem(14), height: rem(14) }} />}
								>
									<Text className="flex items-center justify-between">
										<span>High to Low</span>
										<IconSortDescendingNumbers style={{ width: rem(18), height: rem(18) }} />
									</Text>
								</Menu.Item>
								<Menu.Item
									leftSection={<IconFileDescription style={{ width: rem(14), height: rem(14) }} />}
								>
									<Text className="flex items-center justify-between">
										<span>Low to High</span>
										<IconSortAscendingNumbers style={{ width: rem(18), height: rem(18) }} />
									</Text>
								</Menu.Item>

								<Menu.Divider />
								<Menu.Item>
									<Text mt="md" size="sm">
										Review count <b>{value}</b>
									</Text>
									<Slider value={value} onChange={setValue} onChangeEnd={setEndValue} />
								</Menu.Item>

								<Menu.Divider />
								<Button title="Reset filter" fullWidth variant="filled">
									<IconReload style={{ width: rem(18), height: rem(18) }} />
									<Text className="ml-0.5">Reset filter</Text>
								</Button>
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
						<div className="grid grid-cols-12 grid-rows-3 gap-x-2 gap-y-2">
							{filteredCourses.map((course) => {
								return (
									<CourseCard
										// Ensure that the key is unique, otherwise same keys will cause a lot of issues.
										key={`CourseCard_${(course.courseCode, course.courseName)}`}
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
			{/* </Grid.Col> */}

			{/* Review Feed */}
			{/*<Grid.Col visibleFrom="xl" span={2}>
          <Paper bg="dark.8" p="sm" withBorder className="h-full">
            Lol
          </Paper>
        </Grid.Col>*/}
		</Container>
	);
}
