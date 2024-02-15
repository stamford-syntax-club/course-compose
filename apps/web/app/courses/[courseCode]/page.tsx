"use client";

import {
	Blockquote,
	Button,
	Center,
	Container,
	Divider,
	Flex,
	Pagination,
	Paper,
	Rating,
	Select,
	Stack,
	Title,
	Text
} from "@mantine/core";
import "@mantine/tiptap/styles.css";
import { MyReviewCard, ReviewCard } from "@components/ui/review-card";
import { MarkdownEditor } from "@components/ui/markdown-editor";
import { IconAlertCircle, IconAlertTriangle } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { PaginatedResponse } from "types/pagination";
import { Course } from "types/course";
import { Review } from "types/reviews";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import LinkButton from "@components/ui/back-button";
import Link from "next/link";
import Placeholder from "@tiptap/extension-placeholder";

const academicYearOptions = [
	{ value: "2020", label: "2020" },
	{ value: "2021", label: "2021" },
	{ value: "2022", label: "2022" },
	{ value: "2023", label: "2023" },
	{ value: "2024", label: "2024" }
];

const reviewGuidelines = [
	{
		text: "Your review will be displayed anonymously to the public after approved",
		color: "blue",
		displayIcon: <IconAlertCircle size={25} />
	},
	{
		text: "Kindly refrain from mentioning names and write your reviews with respect. Constructive criticism is encouraged",
		color: "yellow",
		displayIcon: <IconAlertTriangle size={25} />
	}
];

const TOKEN =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImtoaW5nQHN0dWRlbnRzLnN0YW1mb3JkLmVkdSIsImV4cCI6MTcwNzgxNDkxMywic3ViIjoiOGE3YjNjMmUtM2U1Zi00ZjFhLWE4YjctM2MyZTFhNGY1YjZkIn0.TzFf4PXTrFWx9it9xOBrH2AEImBjSLgbt6-dHvlTj_k";

export default function CourseReview({ params }: { params: { courseCode: string } }) {
	const [courseData, setCourseData] = useState<Course>();
	const [reviewsData, setReviewsData] = useState<PaginatedResponse<Review>>();
	const [pageNumber, setPageNumber] = useState(1);
	const markdownEditor = useEditor({
		extensions: [
			StarterKit,
			Markdown,
			Placeholder.configure({
				placeholder:
					"Tell us how did you feel about the course. Do you have any suggestions for other students?"
			})
		]
	});

	const COURSE_ENDPOINT = `http://localhost:8000/api/courses/${params.courseCode}`;

	useEffect(() => {
		async function fetchCourseDetail() {
			try {
				const data = await fetch(COURSE_ENDPOINT);
				const course = await data.json();
				setCourseData(course);
			} catch (e) {
				console.error(e);
			}
		}

		fetchCourseDetail();
	}, []);

	useEffect(() => {
		async function fetchCourseReviews() {
			try {
				const data = await fetch(`${COURSE_ENDPOINT}/reviews?pageNumber=${pageNumber}&pageSize=10`, {
					headers: {
						Authorization: `Bearer ${TOKEN}`
					}
				});
				const reviews = await data.json();

				setReviewsData(reviews);
			} catch (e) {
				console.error(e);
			}
		}

		fetchCourseReviews();
	}, [pageNumber]);

	return (
		<Container>
			{/* course details section */}
			<LinkButton where="/" />
			<Flex direction="column" my="xl" gap="sm" align="center">
				<Title className="text-center text-3xl">
					{courseData?.full_name} ({courseData?.code})
				</Title>
				<Flex direction="row" gap="xs">
					<Title order={3}>Prerequisites:</Title>
					{courseData && courseData.prerequisites.length > 0 ? (
						courseData?.prerequisites.map((preq) => (
							<Link key={`preq_${preq}`} href={`/courses/${preq}`}>
								<Title c={"blue"} order={3}>
									{preq}
								</Title>
							</Link>
						))
					) : (
						<Title order={3}>None</Title>
					)}
				</Flex>
			</Flex>

			<Divider size={5} />

			{/* show reviews section*/}
			<Title my="lg" order={2}>
				What people are saying about {params.courseCode}
			</Title>

			<Stack gap="sm">
				{reviewsData?.data &&
					reviewsData?.data.map((review) =>
						review?.isOwner ? (
							<MyReviewCard key={`my_review_card_${review.id}`} review={review} />
						) : (
							<ReviewCard key={`review_card_${review.id}`} review={review} />
						)
					)}
				<Center>
					<Pagination total={reviewsData?.totalPages ? reviewsData.totalPages : 1} onChange={setPageNumber} />
				</Center>
			</Stack>

			<Divider mt="md" />

			{/* write a review section*/}
			<Title my="md" order={2}>
				Write a Review
			</Title>

			{/* TODO: extract these as a component (reuse it for edit review)*/}
			{reviewGuidelines.map((guide) => (
				<Blockquote key={`"review_guideline_${guide.text}`} color={guide.color} w="100%" p="sm" mb="xs">
					<Flex justify="flex-start" gap="sm">
						{guide.displayIcon}
						<Text>{guide.text}</Text>
					</Flex>
				</Blockquote>
			))}

			<Paper shadow="xs" w="100%" h="100%">
				<Flex direction="row" gap="sm" my="sm">
					<Select data={academicYearOptions} placeholder="Select Academic year" />
					<Rating
						size="lg"
						defaultValue={0}
						fractions={2}
						onChange={(value) => {
							// TODO: validate if user have rated the course before submit}
							// useState, setRating
							console.log(`selected: ${value}`);
						}}
					/>
				</Flex>

				<MarkdownEditor editor={markdownEditor} />
				<Flex gap="sm" justify="end">
					<Button
						mt="md"
						variant="filled"
						onClick={(e) => {
							// TODO: call submit review api and attach this as description
							console.log(markdownEditor?.storage.markdown.getMarkdown());
						}}
					>
						Submit Review
					</Button>
				</Flex>
			</Paper>
		</Container>
	);
}
