"use client";

import { Center, Container, Divider, Flex, Pagination, Stack, Title, Text } from "@mantine/core";
import { MyReviewCard, ReviewCard } from "@components/ui/review-card";
import { useEffect, useState } from "react";
import { PaginatedResponse } from "types/pagination";
import { Course } from "types/course";
import { Review } from "types/reviews";
import BackButton from "@components/ui/back-button";
import Link from "next/link";
import { ErrorResponse } from "types/errors";
import { notifications } from "@mantine/notifications";
import WriteReviewForm from "@components/ui/write-review-form";
import SessionModal from "@components/ui/session-modal";
import { AUTH_TOKEN_KEY, ERR_EXPIRED_TOKEN, ERR_REVIEW_EXIST, ERR_MISSING_TOKEN } from "@utils/constants";

// TODO: remove this when auth is implemented
localStorage.setItem(
	AUTH_TOKEN_KEY,
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImtoaW5nQHN0dWRlbnRzLnN0YW1mb3JkLmVkdSIsImV4cCI6MTcwODE0ODQ1NCwic3ViIjoiOGE3YjNjMmUtM2U1Zi00ZjFhLWE4YjctM2MyZTFhNGY1YjZkIn0.f-CqAxXi72eVj-hBuBmXAD3AuV6ZTOJ3rIwsltmfZQw"
	//"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImtoaW5nQHN0dWRlbnRzLnN0YW1mb3JkLmVkdSIsImV4cCI6MTcwODExMDY0NCwic3ViIjoiOGE3YjNjMmUtM2U1Zi00ZjFhLWE4YjctM2MyZTFhNGY1YjZkIn0.YS_e_SXtq_a1Kwz4T415spS1w0k0R-EhdV2TFK2yWdw"
);
// expired token for test = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImtoaW5nQHN0dWRlbnRzLnN0YW1mb3JkLmVkdSIsImV4cCI6MTcwODEwNDE2NSwic3ViIjoiOGE3YjNjMmUtM2U1Zi00ZjFhLWE4YjctM2MyZTFhNGY1YjZkIn0.4hnlK3iLnRKbQMyB_bKS3wF4mpy0RRL7i02CNF1VUvE"

export default function CourseReview({ params }: { params: { courseCode: string } }) {
	const [courseData, setCourseData] = useState<Course>();
	const [reviewsData, setReviewsData] = useState<PaginatedResponse<Review>>();
	const [pageNumber, setPageNumber] = useState(1);
	const [tokenErr, setTokenErr] = useState(!localStorage.getItem(AUTH_TOKEN_KEY));

	// TODO: make host dynamic (either use api-gateway:8000 or localhost:8000)
	const COURSE_ENDPOINT = `http://localhost:8000/api/courses/${params.courseCode}`;
	const REVIEW_ENDPOINT = `${COURSE_ENDPOINT}/reviews`;

	const fetchCourseDetail = async () => {
		try {
			const data = await fetch(COURSE_ENDPOINT);
			const course = await data.json();
			setCourseData(course);
		} catch (e) {
			console.error(e);
		}
	};

	const fetchCourseReviews = async () => {
		try {
			const data = await fetch(`${REVIEW_ENDPOINT}?pageNumber=${pageNumber}&pageSize=10`, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`
				}
			});
			const reviews = await data.json();

			if ((reviews as ErrorResponse).message == ERR_EXPIRED_TOKEN) {
				setTokenErr(true);
				return;
			}

			setReviewsData(reviews);
		} catch (e) {
			console.error(e);
		}
	};

	const submitReview = async (academicYear: string, description: string, rating: number) => {
		const res = await fetch(REVIEW_ENDPOINT, {
			method: "POST",
			body: JSON.stringify({
				academic_year: parseInt(academicYear),
				description: description,
				rating: rating
			}),
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`
			}
		});
		const data = await res.json();

		switch ((data as ErrorResponse).message) {
			case ERR_REVIEW_EXIST:
				notifications.show({
					title: ERR_REVIEW_EXIST,
					message: "You can either edit or delete your existing review",
					color: "red",
					autoClose: 5000
				});
				break;
			case ERR_MISSING_TOKEN || ERR_EXPIRED_TOKEN:
				setTokenErr(true);
				break;
			default:
				notifications.show({
					title: "Submit review successfully",
					message: "Your review has been submitted. Thank you so much for making Stamford a better place!",
					color: "green"
				});
				setTimeout(() => {
					window.location.reload();
				}, 5000);
		}
	};

	useEffect(() => {
		fetchCourseDetail();
	}, []);

	useEffect(() => {
		fetchCourseReviews();
	}, [pageNumber, tokenErr]);

	return (
		<Container>
			{/* course details section */}
			<BackButton href="/" pageName="Home" />
			<Flex direction="column" my="xl" gap="sm" align="center">
				<Title className="text-center text-3xl">
					{courseData?.full_name} ({courseData?.code})
				</Title>
				<Flex direction="row" gap="xs">
					<Title order={3}>Prerequisites:</Title>
					{courseData?.prerequisites && courseData.prerequisites.length > 0 ? (
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

			{tokenErr && (
				<SessionModal
					onCloseCallBack={() => {
						setTokenErr(false);
					}}
				/>
			)}

			{/* show reviews section*/}
			<Title my="lg" order={2}>
				What people are saying about {params.courseCode}
			</Title>

			<Stack gap="sm">
				{reviewsData?.data && reviewsData.data.length > 0 ? (
					reviewsData?.data.map((review) =>
						review?.isOwner ? (
							<MyReviewCard key={`my_review_card_${review.id}`} review={review} />
						) : (
							<ReviewCard key={`review_card_${review.id}`} review={review} />
						)
					)
				) : (
					<Center my="md">
						<Text>No reviews for this course</Text>
					</Center>
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
			<WriteReviewForm
				onSubmitCallBack={(academicYear, description, rating) => {
					submitReview(academicYear, description, rating);
				}}
			/>
		</Container>
	);
}
