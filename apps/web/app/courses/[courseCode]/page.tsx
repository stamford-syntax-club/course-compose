"use client";

import { Center, Container, Divider, Flex, Pagination, Stack, Title, Text, Loader } from "@mantine/core";
import { MyReviewCard, ReviewCard } from "@components/ui/review-card";
import { useEffect, useState } from "react";
import { PaginatedResponse } from "types/pagination";
import { Course } from "types/course";
import { Review } from "types/reviews";
import BackButton from "@components/ui/back-button";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { ErrorResponse } from "types/errors";
import { notifications } from "@mantine/notifications";
import WriteReviewForm from "@components/ui/write-review-form";
import SessionModal from "@components/ui/session-modal";
import {
	ERR_EXPIRED_TOKEN,
	ERR_REVIEW_EXIST,
	ERR_MISSING_TOKEN,
	ERR_USER_NOT_EXIST,
	BASE_API_ENDPOINT
} from "@utils/constants";
import { Session } from "@supabase/supabase-js";
import { useSupabaseStore } from "@stores/supabase-store";
import { fetchCourseDetails, fetchCourseReviews } from "lib/api/api";

export default function CourseReview({ params }: { params: { courseCode: string } }) {
	const [courseData, setCourseData] = useState<Course>();
	const [reviewsData, setReviewsData] = useState<PaginatedResponse<Review>>();
	const [sessionData, setSessionData] = useState<Session | null>();
	const [isLoading, setIsLoading] = useState(true);
	const [pageNumber, setPageNumber] = useState(1);
	const { supabase } = useSupabaseStore();
	const [opened, { open, close }] = useDisclosure(false);

	const COURSE_ENDPOINT = `${BASE_API_ENDPOINT}/courses/${params.courseCode}`;
	const REVIEW_ENDPOINT = `${COURSE_ENDPOINT}/reviews`;

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
				Authorization: `Bearer ${sessionData?.access_token ? sessionData?.access_token : ""}`
			}
		});
		const data = await res.json();

		switch ((data as ErrorResponse).message) {
			case undefined:
				notifications.show({
					title: "Submit review successfully",
					message: "Your review has been submitted. Thank you so much for making Stamford a better place!",
					color: "green"
				});
				setTimeout(() => {
					window.location.reload();
				}, 5000);
				break;
			case ERR_REVIEW_EXIST:
				notifications.show({
					title: ERR_REVIEW_EXIST,
					message: "You can either edit or delete your existing review",
					color: "red",
					autoClose: 5000
				});
				break;
			case ERR_MISSING_TOKEN || ERR_EXPIRED_TOKEN || ERR_USER_NOT_EXIST:
				open(); // session modal
				break;
			default:
				notifications.show({
					title: "Something is wrong on our end",
					message: "Your review cannot be submitted yet, please try again later",
					color: "red",
					autoClose: 5000
				});
		}
	};

	const editReview = async (id: number, academicYear: string, description: string, rating: number) => {
		const res = await fetch(`${REVIEW_ENDPOINT}/edit`, {
			method: "PUT",
			body: JSON.stringify({
				id: id,
				academic_year: parseInt(academicYear),
				description: description,
				rating: rating
			}),
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionData?.access_token ? sessionData?.access_token : ""}`
			}
		});

		const data = await res.json();
		console.log(data);
	};

	useEffect(() => {
		if (isLoading) {
			return; // prevent fetching before the session is retrieved
		}

		setIsLoading(true);

		fetchCourseReviews(params.courseCode, pageNumber, sessionData?.access_token || "")
			.then((reviews) => setReviewsData(reviews))
			.catch(() => open()) // expired token
			.finally(() => setIsLoading(false));

		if (!sessionData) open();
		else close();
	}, [pageNumber, sessionData]);

	useEffect(() => {
		fetchCourseDetails(params.courseCode)
			.then((course) => setCourseData(course))
			.catch((error) => console.error(error)); // TODO: handle if no course found? - maybe redirect to home page

		setIsLoading(true);

		supabase?.auth
			.getSession()
			.then((session) => {
				setSessionData(session.data.session);
			})
			.catch((error) => {
				console.error(error);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [supabase]);

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

			{/* show reviews section*/}
			<Title my="lg" order={2}>
				What people are saying about {params.courseCode}
			</Title>

			<SessionModal opened={opened} open={open} close={close} />

			{isLoading && (
				<Center my="md">
					<Loader />
				</Center>
			)}

			<Stack gap="sm">
				{reviewsData?.data &&
					reviewsData.data.length > 0 &&
					reviewsData?.data.map((review) =>
						review?.isOwner ? (
							<MyReviewCard
								key={`my_review_card_${review.id}`}
								review={review}
								onEditReview={(id, academicYear, description, rating) =>
									editReview(id, academicYear, description, rating)
								}
							/>
						) : (
							<ReviewCard key={`review_card_${review.id}`} review={review} />
						)
					)}

				{!isLoading && !reviewsData?.data.length && (
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
				onSubmit={(academicYear, description, rating) => submitReview(academicYear, description, rating)}
			/>
		</Container>
	);
}
