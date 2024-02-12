"use client";

import {
	Blockquote,
	Box,
	Button,
	Card,
	Container,
	Divider,
	Flex,
	Group,
	Image,
	Paper,
	Rating,
	Select,
	Stack,
	Text,
	Title
} from "@mantine/core";
import UserReview from "@components/ui/review-card";
import "@mantine/tiptap/styles.css";
import { MarkdownEditor } from "@components/ui/markdown-editor";
import { IconAlertTriangleFilled } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface ReviewResponse {
	pageInformation: { number: number; size: number };
	totalNumberOfItems: number;
	totalPages: number;
	data: {
		id: number;
		academicYear: number;
		description: string;
		isOwner: boolean;
		rating: number;
		status: string;
		votes: number;
		course: { id: number; code: string };
		profile: { id: string };
		created_at: Date;
	}[];
}

export default function CourseReview({ params }: { params: { courseCode: string } }) {
	const academicYearOptions = [
		{ value: "2020", label: "2020" },
		{ value: "2021", label: "2021" },
		{ value: "2022", label: "2022" }
		//academic years here
	];

	const [reviewsData, setReviewsData] = useState<ReviewResponse>();

	useEffect(() => {
		async function fetchCourseReviews() {
			const data = await fetch(`http://localhost:8000/api/courses/${params.courseCode}/reviews`);
			const reviews = await data.json();

			setReviewsData(reviews);
		}

		fetchCourseReviews();
	}, []);

	return (
		<Container>
			{/* headings */}
			<Card shadow="sm" padding="md" radius="md" w="100%" mb="sm">
				<Flex direction="row" gap="5">
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
				<Title>Programming 1</Title>
				<Text>Information Technology</Text>
				<Text>ITE221</Text>
			</Card>
			{/* reviews and ratings */}
			<Box className="rounded-lg border-2 border-solid border-gray-500 p-2">
				<Flex justify="space-between" m="lg" mb="lg">
					<Title>Reviews</Title>
					<Group>
						<Rating value={3.5} fractions={2} size="xl" readOnly />
						<Title>Rating: 4.5</Title>
						<Title>Reviews: 100</Title>
					</Group>
				</Flex>

				{/* instead of scrollarea we can  have page numbers */}
				<Stack gap="sm">
					{/* review datas */}
					{reviewsData?.data.map((review) => (
						<UserReview
							academicYear={review.academicYear}
							description={review.description}
							isOwner={review.isOwner ?? false}
							rating={review.rating}
							status={review.status}
							votes={review.votes}
							createdAt={review.created_at}
						/>
					))}
				</Stack>

				<Divider mt="md" />
				{/* write reviews */}
				<Box>
					<Box className="flex w-full justify-between p-4">
						<Title order={2}>Write a Review</Title>
						<Rating size="lg" defaultValue={0} fractions={2} />
						<Select data={academicYearOptions} placeholder="Select academic year" />
					</Box>
					<Blockquote color="yellow" w="100%" p="sm">
						<Flex justify="center" gap="4" align="center">
							<IconAlertTriangleFilled size={20} />
							Life is like an npm install – you never know what you are going to get.
						</Flex>
					</Blockquote>

					<Group>
						<Paper p="md" shadow="xs" w="100%" h="100%">
							{/* markdown  */}
							<MarkdownEditor />

							<Flex gap="sm" justify="end">
								<Button mt="md">Submit</Button>
								<Button mt="md" variant="light">
									Cancel
								</Button>
							</Flex>
						</Paper>
					</Group>
				</Box>
			</Box>
		</Container>
	);
}
