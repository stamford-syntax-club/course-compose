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
	LoadingOverlay
} from "@mantine/core";
import {
	IconMoodSad,
	IconSortAscending,
	IconSortAscendingNumbers,
	IconSortDescendingNumbers
} from "@tabler/icons-react";
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

	const apiClient = useMemo(() => new CourseComposeAPIClient(""), []);
	useEffect(() => {
		setIsLoading(true);
		apiClient
			.fetchCourse(debounceSearchValue, pageNumber)
			.then((data) => {
				setCOURSE_LIST(data);
				console.log("Course list: ", data);
				setIsLoading(false);
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
								<Menu.Item mb="md">
									{/* Rating Filter */}
									<Title order={6}>Ratings</Title>
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

								<Menu.Item mb="md">
									{/* Review Count Filter */}
									<Title order={6}>Review Count</Title>
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

								<Menu.Item>
									{/* Sort Options */}
									<Title order={6}>Sort by</Title>
									<Menu.Item leftSection={<IconSortAscendingNumbers size={14} />}>
										Rating (Asc)
									</Menu.Item>
									<Menu.Item leftSection={<IconSortDescendingNumbers size={14} />}>
										Rating (Desc)
									</Menu.Item>
									<Menu.Item leftSection={<IconSortAscending size={14} />}>Name (Asc)</Menu.Item>
									<Menu.Item leftSection={<IconSortDescending size={14} />}>Name (Desc)</Menu.Item>
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
