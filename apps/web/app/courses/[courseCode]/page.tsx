"use client";

import {
	Blockquote,
	Box,
	Button,
	Center,
	Container,
	Divider,
	Flex,
	Grid,
	Pagination,
	Paper,
	Image,
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
import { Review } from "types/reviews";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import LinkButton from "@components/ui/back-button";

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

const markDownTemplate = `
#### Tell us how did you feel about the course

Answer:  

#### Were there a lot of assignments?

Answer: 

#### Do you have any suggestions for other students?

Answer: 
`;

export default function CourseReview({ params }: { params: { courseCode: string } }) {
	const [reviewsData, setReviewsData] = useState<PaginatedResponse<Review>>();
	const [pageNumber, setPageNumber] = useState(1);

	useEffect(() => {
		async function fetchCourseReviews() {
			const data = await fetch(
				//				`http://localhost:8000/api/courses/${params.courseCode}/reviews?pageNumber=${pageNumber}&pageSize=10`,
				`http://localhost:8000/api/courses/${params.courseCode}/reviews?pageNumber=${pageNumber}`,
				{
					headers: {
						Authorization: `Bearer ${"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImtoaW5nQHN0dWRlbnRzLnN0YW1mb3JkLmVkdSIsImV4cCI6MTcwNzc1MzEyMCwic3ViIjoiOGE3YjNjMmUtM2U1Zi00ZjFhLWE4YjctM2MyZTFhNGY1YjZkIn0.tbjXsCJVVl-QtIHh5-QNy_6TNSx6RrPCOoz758c0ULk"}`
					}
				}
			);
			const reviews = await data.json();

			setReviewsData(reviews);
		}

		fetchCourseReviews();
	}, [pageNumber]);

	const markdownEditor = useEditor({
		extensions: [StarterKit, Markdown],
		content: markDownTemplate
	});

	return (
		<Container>
			{/* headings */}
			<LinkButton where="/" />
			<Flex direction="column" gap="sm">
				<Flex direction="row" gap="md" mt="md">
					<Box component="a" href="/">
						<Image
							h="auto"
							w={300}
							src="/assets/logos/stamford-logo-clearbg-white.png"
							alt="Stamford Internation University logo"
						/>
					</Box>
					<Box component="a" href="/">
						<Image
							h={90}
							w={90}
							src="/assets/logos/codelogo.png"
							alt="Stamford Internation University logo"
							radius={50}
						/>
					</Box>
				</Flex>
				<Title order={1}>ITE221 - Programming 1</Title>
				{/* TODO: add prerequisites */}
			</Flex>

			<Divider size={5} mt="md" />

			{/* show reviews section*/}
			<Title my="sm" order={2}>
				What people are saying about {params.courseCode}
			</Title>

			<Stack gap="sm">
				{reviewsData?.data &&
					reviewsData?.data.map((review) =>
						review?.isOwner ? <MyReviewCard review={review} /> : <ReviewCard review={review} />
					)}
				<Center>
					<Pagination total={reviewsData?.totalPages ? reviewsData.totalPages : 1} onChange={setPageNumber} />
				</Center>
			</Stack>

			<Divider mt="md" />

			{/* write a review section*/}
			<Grid my="sm">
				<Grid.Col span={4}>
					<Flex justify="flex-start">
						<Title order={2}>Write a Review</Title>
					</Flex>
				</Grid.Col>
				<Grid.Col span={4}>
					<Flex justify="center">
						<Rating size="lg" defaultValue={0} fractions={2} />
					</Flex>
				</Grid.Col>
				<Grid.Col span={4}>
					<Flex justify="flex-end">
						<Select data={academicYearOptions} placeholder="Academic year" />
					</Flex>
				</Grid.Col>
			</Grid>

			{reviewGuidelines.map((guide) => (
				<Blockquote color={guide.color} w="100%" p="sm" mb="xs">
					<Flex justify="flex-start" gap="sm">
						{guide.displayIcon}
						<Text>{guide.text}</Text>
					</Flex>
				</Blockquote>
			))}

			<Paper shadow="md" w="100%" h="100%">
				<MarkdownEditor editor={markdownEditor} />
				<Flex gap="sm" justify="end">
					<Button
						mt="md"
						onClick={(e) => {
							console.log(markdownEditor?.storage.markdown.getMarkdown());
						}}
					>
						Submit
					</Button>
					<Button mt="md" variant="light">
						Cancel
					</Button>
				</Flex>
			</Paper>
		</Container>
	);
}
