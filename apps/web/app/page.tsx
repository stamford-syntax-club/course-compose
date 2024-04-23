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
	Slider,
	Title
} from "@mantine/core";
import {
	IconMoodSad,
	IconSortAscending,
	IconSortAscendingNumbers,
	IconSortDescendingNumbers
} from "@tabler/icons-react";
import {
	IconFileDescription,
	IconFilter,
	IconReload,
	IconSearch,
	IconSortDescending,
	IconStarFilled
} from "@tabler/icons-react";
import CourseComposeAPIClient from "lib/api/api";
import { useEffect, useState } from "react";
import { Course } from "types/course";
import { PaginatedResponse } from "types/pagination";
import { useDebouncedValue } from "@mantine/hooks";
import { useMemo } from "react";

export default function HomePage(): JSX.Element {
	const [currentSearch, setCurrentSearch] = useState("");
	const [value, setValue] = useState(0);
	const [endValue, setEndValue] = useState(200);
	const [COURSE_LIST, setCOURSE_LIST] = useState<PaginatedResponse<Course>>();
	const [pageNumber, setPageNumber] = useState(1);
	const [debounceSearchValue] = useDebouncedValue(currentSearch, 200);

	const apiClient = useMemo(() => new CourseComposeAPIClient(""), []);
	useEffect(() => {
		apiClient
			.fetchCourse(debounceSearchValue, pageNumber)
			.then((data) => {
				setCOURSE_LIST(data);
				console.log("Course list: ", data);
			})
			.catch((error) => {
				console.error("Error fetching course list: ", error);
			});
	}, [pageNumber, apiClient, debounceSearchValue]);

	const handleSearchValueChange = (event: { target: { value: any } }) => {
		const searchValue = event.target.value;
		setCurrentSearch(searchValue);
		setPageNumber(1);
	};

	return (
		<Container fluid className="h-full">
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
								handleSearchValueChange(e);
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

				<Paper bg="dark.8" p="sm" withBorder className="h-full">
					{/* Courses List Body */}
					{COURSE_LIST && COURSE_LIST.data.length > 0 ? (
						//course state with results
						<div className="relative flex size-full flex-col">
							<div className="grid grid-cols-12 grid-rows-3 gap-x-2 gap-y-2">
								{COURSE_LIST &&
									COURSE_LIST.data.map((course) => {
										return (
											<CourseCard
												// Ensure that the key is unique, otherwise same keys will cause a lot of issues.
												key={`CourseCard_${(course.code, course.full_name)}`}
												courseName={course.full_name}
												courseCode={course.code}
												coursePrerequisites={course.prerequisites}
												courseRating={course.overall_ratings}
												courseReviewCount={course.reviews_count}
											/>
										);
									})}
							</div>

							<div className="mt-auto flex items-center justify-center">
								<Pagination
									withEdges
									total={COURSE_LIST?.totalPages ?? 1}
									value={pageNumber}
									onChange={setPageNumber}
								/>
							</div>
						</div>
					) : (
						//Empty state of the course list
						<div className="p-sm flex h-full flex-col items-center justify-center text-center">
							<IconMoodSad size={50} />
							<Title order={2} textWrap="wrap" c={"gray"}>
								No course result found for your search!
							</Title>
						</div>
					)}
				</Paper>
			</Stack>
		</Container>
	);
}
