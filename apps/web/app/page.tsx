"use client";

import { CourseCard } from "@components/ui/cards/course-card";
import {
	Button,
	Group,
	Menu,
	Pagination,
	Paper,
	Stack,
	TextInput,
	Container,
	Text,
	Title,
	Loader,
	Select,
	Box,
	Tooltip,
	Divider
} from "@mantine/core";
import { IconMoodSad, IconSortAscending, IconFilter, IconSearch, IconSortDescending } from "@tabler/icons-react";
import CourseComposeAPIClient from "lib/api/api";
import { useEffect, useState, useMemo, useRef } from "react";
import type { Course } from "types/course";
import type { PaginatedResponse } from "types/pagination";
import { useDebouncedValue } from "@mantine/hooks";

// Popular searches in course code
const popularSearches = ["ITE", "MAS", "MKT", "ENT", "CMD", "BUS", "IHM", "ABM"];

export default function HomePage(): JSX.Element {
	const [currentSearch, setCurrentSearch] = useState("");
	// TODO: wait for backend to implement filter based on aggregated values
	//	const [minimumRating, setMinimumRating] = useState(0);
	//	const [minimumReviews, setMinimumReviews] = useState(0);
	const [courseList, setCourseList] = useState<PaginatedResponse<Course>>();
	const [pageNumber, setPageNumber] = useState(1);
	const [debounceSearchValue] = useDebouncedValue(currentSearch, 300);
	const [isLoading, setIsLoading] = useState(false);
	const [sortField, setSortField] = useState("reviewCount");
	const [sortOrder, setSortOrder] = useState("desc");
	const quickSearchInputRef = useRef<HTMLInputElement>(null);

	const apiClient = useMemo(() => new CourseComposeAPIClient(""), []);
	useEffect(() => {
		setIsLoading(true);
		apiClient
			.fetchCourse(sortField, sortOrder, debounceSearchValue, pageNumber)
			.then((data) => {
				setCourseList(data);
				setIsLoading(false);
			})
			.catch((error) => {
				console.error("Error fetching course list: ", error);
			});
	}, [pageNumber, apiClient, debounceSearchValue, sortField, sortOrder]);

	//handle the search result to always set at page 1
	const handleSearchValueChange = (event: { target: { value: any } }): void => {
		const searchValue = event.target.value;
		setCurrentSearch(searchValue);
		setPageNumber(1);
	};

	return (
		<Container fluid className="min-h-full">
			<Stack className="h-full" gap="md">
				{/* Searchbar Container */}
				<form
					onSubmit={(e) => {
						e.preventDefault();
						const formData = new FormData(e.target as HTMLFormElement);
						setCurrentSearch(formData.get("course-searchbar") as string);
					}}
				>
					<Group wrap="nowrap" gap="sm">
						<TextInput
							name="course-searchbar"
							leftSection={<IconSearch className="size-4" />}
							className="w-full"
							placeholder="Search"
							onChange={(e) => {
								handleSearchValueChange(e);
							}}
							ref={quickSearchInputRef}
						/>

						{/* Dropdown Menu for Filter */}
						<Menu shadow="md" width={200}>
							<Menu.Target>
								<Button type="button" variant="outline">
									<IconFilter className="size-4" aria-label="Filter" />
								</Button>
							</Menu.Target>

							<Menu.Dropdown>
								{/* <Title order={6}>Minimum Ratings</Title> */}
								{/* <Menu.Item mb="md"> */}
								{/* Rating Filter */}
								{/* <Slider
										value={minimumRating}
										onChange={setMinimumRating}
										min={0}
										max={5}
										step={0.5}
										marks={[
											{ value: 0, label: "0" },
											{ value: 1, label: "1" },
											{ value: 2, label: "2" },
											{ value: 3, label: "3" },
											{ value: 4, label: "4" },
											{ value: 5, label: "5" }
										]}
									/> */}
								{/* </Menu.Item> */}

								{/* <Title order={6}>Minimum Review Count</Title> */}
								{/* <Menu.Item mb="md"> */}
								{/* Review Count Filter */}
								{/* <Slider
										value={minimumReviews}
										onChange={setMinimumReviews}
										min={0}
										max={40}
										step={10}
										marks={[
											{ value: 0, label: "0" },
											{ value: 10, label: "10" },
											{ value: 20, label: "20" },
											{ value: 30, label: "30" },
											{ value: 40, label: "40" }
										]}
									/> */}
								{/* </Menu.Item> */}

								<Title order={6} mb="xs">Sort By</Title>
								<Box mb="md">
									<Select
										value={sortField}
										onChange={(value) => {
											setSortField(value || "name")
											setSortOrder(value === "reviewCount" ? "desc" : "asc")
										}}
										placeholder="Sort by"
										data={[
											// { value: "rating", label: "Rating" },
											{ value: "name", label: "Name" },
											{ value: "reviewCount", label: "Review Count" }
										]}
									/>
								</Box>

								<Box className="flex items-center justify-center">
									<Group gap="xs">
										<Tooltip label="Sort Ascending" position="top">
											<Button
												variant={sortOrder === "asc" ? "filled" : "outline"}
												onClick={() => {
													setSortOrder("asc");
												}}
											>
												<IconSortAscending size={14} />
											</Button>
										</Tooltip>

										<Tooltip label="Sort Descending" position="top">
											<Button
												variant={sortOrder === "desc" ? "filled" : "outline"}
												onClick={() => {
													setSortOrder("desc");
												}}
											>
												<IconSortDescending size={14} />
											</Button>
										</Tooltip>
									</Group>
								</Box>
							</Menu.Dropdown>
						</Menu>

						{/* Search Button */}
						<Button type="submit">
							<IconSearch className="size-4" aria-label="Filter" />
						</Button>
					</Group>
				</form>

				{/* Popular Searches */}
				<Group gap="xs" preventGrowOverflow={false} wrap="nowrap" className="w-full overflow-y-hidden">
					<Title className="min-w-max" order={4}>
						Quick searches :
					</Title>
					{popularSearches.map((quickCourseCode) => (
						<Button
							key={`popularSearch_${quickCourseCode}`}
							radius={45}
							className="min-w-min"
							size="xs"
							onClick={() => {
								if (quickSearchInputRef.current) {
									quickSearchInputRef.current.value = quickCourseCode;
									handleSearchValueChange({ target: { value: quickCourseCode } });
									setPageNumber(1);
								}
							}}
						>
							{quickCourseCode}
						</Button>
					))}
				</Group>

				<Divider />

				<Title order={2} className="text-start">
					Course Reviews
				</Title>

				{/* Courses List Body */}
				<Paper bg="dark.8" p="sm" withBorder className="h-full">
					{isLoading ? (
						<div className="flex w-full flex-col items-center gap-y-4">
							<Loader color="blue" type="bars" />
							<Text>Loading</Text>
						</div>
					) : null}
					{!isLoading && courseList && courseList.data.length > 0 ? (
						<div className="relative flex size-full flex-col">
							<div className="grid grid-cols-12 grid-rows-3 gap-x-2 gap-y-2">
								{courseList.data.map((course) => (
									<CourseCard
										key={`CourseCard_${course.code}`}
										full_name={course.full_name}
										code={course.code}
										prerequisites={course.prerequisites}
										overall_ratings={course.overall_ratings}
										reviews_count={course.reviews_count}
									/>
								))}
							</div>
							<div className="mt-6 flex items-center justify-center">
								<Pagination
									withEdges
									total={courseList.totalPages}
									value={pageNumber}
									onChange={setPageNumber}
								/>
							</div>
						</div>
					) : null}
					{!isLoading && courseList && courseList.data.length === 0 ? (
						<div className="p-sm flex h-full flex-col items-center justify-center text-center">
							<IconMoodSad size={50} />
							<Title order={2} textWrap="wrap" c="gray">
								No course result found for your search!
							</Title>
						</div>
					) : null}
				</Paper>
			</Stack>
		</Container>
	);
}
