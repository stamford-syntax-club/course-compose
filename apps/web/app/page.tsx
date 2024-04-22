"use client";

import { CourseCard } from "@components/ui/course-card";
import {
	Button,
	Group,
	Menu,
	Pagination,
	Paper,
	Stack,
	TextInput,
	Container,
	Slider,
	Title,
	LoadingOverlay,
	Select,
	Box,
	Tooltip
} from "@mantine/core";
import { IconMoodSad, IconSortAscending } from "@tabler/icons-react";
import { IconFilter, IconSearch, IconSortDescending } from "@tabler/icons-react";
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
	const [debounceSearchValue] = useDebouncedValue(currentSearch, 300);
	const [isLoading, setIsLoading] = useState(false);
	const [sortCourse, setSortCourse] = useState({ field: "rating", order: "ascending" });

	const apiClient = useMemo(() => new CourseComposeAPIClient(""), []);
	useEffect(() => {
		setIsLoading(true);
		apiClient
			.fetchCourse(debounceSearchValue, pageNumber)
			.then((data) => {
				//sorting the course list with rating, name and review count
				let sortedCourseList = [...data.data];

				sortedCourseList.sort((a, b) => {
					let comparison;
					switch (sortCourse.field) {
						case "rating":
							comparison =
								sortCourse.order === "asc"
									? a.overall_ratings - b.overall_ratings
									: b.overall_ratings - a.overall_ratings;
							break;
						case "name":
							comparison =
								sortCourse.order === "asc"
									? a.full_name.localeCompare(b.full_name)
									: b.full_name.localeCompare(a.full_name);
							break;
						case "review_count":
							comparison =
								sortCourse.order === "asc"
									? a.reviews_count - b.reviews_count
									: b.reviews_count - a.reviews_count;
							break;
						default:
							comparison = 0;
					}
					return comparison;
				});

				//filter the course list with the rating and review count
				const filteredCourse = sortedCourseList.filter((course) => {
					return (
						course.overall_ratings >= value && course.reviews_count >= 0 && course.reviews_count <= endValue
					);
				});

				setCOURSE_LIST({ ...data, data: filteredCourse });
				console.log("Course list: ", data);
				setIsLoading(false);
			})
			.catch((error) => {
				console.error("Error fetching course list: ", error);
			});
	}, [pageNumber, apiClient, debounceSearchValue, value, endValue]);

	//handle the search result to always set at page 1
	const handleSearchValueChange = (event: { target: { value: any } }) => {
		const searchValue = event.target.value;
		setCurrentSearch(searchValue);
		setPageNumber(1);
	};

	//handle the sort order of the course list
	const handleSortOrder = (order: string) => {
		setSortCourse({ ...sortCourse, order: order });
	};

	const handleSearchValueChange = (event: { target: { value: any; }; }) => {
		const searchValue = event.target.value;
		setCurrentSearch(searchValue);
		setPageNumber(1);
	}
	
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
						/>

						{/* Dropdown Menu for Filter */}
						<Menu shadow="md" width={200}>
							<Menu.Target>
								<Button type="button" variant="outline">
									<IconFilter className="size-4" aria-label="Filter" />
								</Button>
							</Menu.Target>

							<Menu.Dropdown>
								<Title order={6}>Ratings</Title>
								<Menu.Item mb="md">
									{/* Rating Filter */}

									<Slider
										value={value}
										onChange={setValue}
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
									/>
								</Menu.Item>

								<Title order={6}>Review Count</Title>
								<Menu.Item mb="md">
									{/* Review Count Filter */}

									<Slider
										value={endValue}
										onChange={setEndValue}
										min={0}
										max={200}
										step={10}
										marks={[
											{ value: 0, label: "0" },
											{ value: 50, label: "50" },
											{ value: 100, label: "100" },
											{ value: 150, label: "150" },
											{ value: 200, label: "200" }
										]}
									/>
								</Menu.Item>

								<Title order={6}>Sort By</Title>
								<Box mb="md">
									<Select
										value={sortCourse.field}
										onChange={(value) =>
											setSortCourse({ field: value || "rating", order: sortCourse.order })
										}
										placeholder="Sort by"
										data={[
											{ value: "rating", label: "Rating" },
											{ value: "name", label: "Name" },
											{ value: "review_count", label: "Review Count" }
										]}
									/>
								</Box>

								<Box className="flex items-center justify-center">
									<Group gap="xs">
										<Tooltip label="Sort Ascending" position="top">
											<Button
												variant={sortCourse.order === "desc" ? "filled" : "outline"}
												onClick={() => handleSortOrder("desc")}
											>
												<IconSortAscending size={14} />
											</Button>
										</Tooltip>

										<Tooltip label="Sort Descending" position="top">
											<Button
												variant={sortCourse.order === "asc" ? "filled" : "outline"}
												onClick={() => handleSortOrder("asc")}
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

				{/* Courses List Body */}
				<LoadingOverlay
					visible={isLoading}
					zIndex={1000}
					overlayProps={{ radius: "sm", blur: 2 }}
					loaderProps={{ color: "blue", type: "bars" }}
				/>
				<Paper bg="dark.8" p="sm" withBorder className="h-full">
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
							<div className="mt-6 flex items-center justify-center">
								<Pagination
									withEdges
									total={COURSE_LIST?.totalPages ?? 1}
									value={pageNumber}
									onChange={setPageNumber}
								/>
							</div>
						</div>
					) : isLoading ? null : (
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
