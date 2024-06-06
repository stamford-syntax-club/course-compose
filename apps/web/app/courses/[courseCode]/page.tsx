"use client";

import {
	Center,
	Container,
	Divider,
	Flex,
	Pagination,
	Stack,
	Title,
	Text,
	Loader,
	Alert,
	Blockquote
} from "@mantine/core";
import { MyReviewCard, ReviewCard } from "@components/ui/review-card";
import { useEffect, useMemo, useState } from "react";
import type { PaginatedResponse } from "types/pagination";
import type { Course } from "types/course";
import type { Review } from "types/reviews";
import { useDisclosure, useWindowScroll } from "@mantine/hooks";
import Link from "next/link";
import type { NotificationData } from "@mantine/notifications";
import { notifications } from "@mantine/notifications";
import WriteReviewForm from "@components/ui/write-review-form";
import SessionModal from "@components/ui/session-modal";
import type { Session } from "@supabase/supabase-js";
import CourseComposeAPIClient from "lib/api/api";
import { useAuth } from "hooks/use-auth";
import { IconAlertCircle, IconLock } from "@tabler/icons-react";

interface CourseReviewProps {
	params: {
		courseCode: string;
	};
}

export default function CourseReview({ params }: CourseReviewProps): JSX.Element {
	const [courseData, setCourseData] = useState<Course>();
	const [reviewsData, setReviewsData] = useState<PaginatedResponse<Review>>();
	const [sessionData, setSessionData] = useState<Session | null>();
	const [showReviewLimitAlert, setShowReviewLimitAlert] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [pageNumber, setPageNumber] = useState(1);
	const [scroll, scrollTo] = useWindowScroll();
	const apiClient = useMemo(() => new CourseComposeAPIClient(params.courseCode), [params.courseCode]);
	const { getSession } = useAuth();
	const [opened, { open: openSessionModal, close: closeSessionModal }] = useDisclosure(false);

	const handleSubmitResponse = (result: NotificationData): void => {
		if (!result.title || !result.message) {
			// inform user to re-login when submit with missing or expired token
			openSessionModal();
			return;
		}

		if (result.color === "green") {
			setPageNumber(1);
			scrollTo({ y: 0 });
		}

		notifications.show(result);
		apiClient
			.fetchCourseReviews(pageNumber, sessionData?.access_token || "")
			.then((reviews) => {
				// tries to read further with anonymous or non-active status
				// backend forces back to the same page
				if (reviews.pageInformation.number !== pageNumber) {
					setPageNumber(1);
					setShowReviewLimitAlert(true);
				}

				setReviewsData(reviews);
			})
			.catch(console.error);
	};

	useEffect(() => {
		apiClient
			.fetchCourseDetails()
			.then((course) => {
				setCourseData(course);
			})
			.catch(console.error); // TODO: handle if no course found? - maybe redirect to home page

		setIsLoading(true);

		getSession()
			.then((session) => {
				setSessionData(session);
				if (!session) openSessionModal();
			})
			.catch(console.error)
			.finally(() => {
				setIsLoading(false);
			});
	}, [apiClient, getSession, openSessionModal]);

	useEffect(() => {
		if (sessionData === undefined) {
			return; // prevent fetching before the session is retrieved
		}
		setIsLoading(true);

		const fetchCourseReviews = async (): Promise<void> => {
			try {
				const reviews = await apiClient.fetchCourseReviews(pageNumber, sessionData?.access_token || "");

				// tries to read further with anonymous or non-active status
				// backend forces back to the same page
				if (reviews.pageInformation.number !== pageNumber) {
					setPageNumber(1);
					setShowReviewLimitAlert(true);
				}

				setReviewsData(reviews);
			} catch (err) {
				console.error(err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchCourseReviews().catch(console.error);
	}, [apiClient, pageNumber, sessionData]);

	return (
		<Container>
			{/* course details section */}
			<Flex direction="column" my="xl" gap="sm" align="center">
				<Title className="text-center text-3xl">
					{courseData?.full_name} ({courseData?.code})
				</Title>
				<Flex direction="row" gap="xs">
					<Title order={3}>Prerequisites:</Title>
					{courseData?.prerequisites && courseData.prerequisites.length > 0 ? (
						courseData.prerequisites.map((preq) => (
							<Link key={`preq_${preq}`} href={`/courses/${preq}`}>
								<Title c="blue" order={3}>
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

			<SessionModal opened={opened} open={openSessionModal} close={closeSessionModal} />

			{isLoading ? (
				<Center my="md">
					<Loader />
				</Center>
			) : null}

			<Stack gap="sm">
				<Alert color="blue" icon={<IconAlertCircle />}>
					Reviews are based on individual experiences and may be subjective. Always consult your academic
					advisors when selecting courses.
				</Alert>
				{showReviewLimitAlert ? (
					<Alert color="yellow" icon={<IconLock />}>
						Explore up to 2 reviews per course. Unlock this by submitting your first review in any courses
						you have taken.
					</Alert>
				) : null}
				{reviewsData?.data && reviewsData.data.length > 0
					? reviewsData.data.map((review) =>
							review.isOwner ? (
								<MyReviewCard
									key={`my_review_card_${review.id}`}
									review={review}
									onEditReview={(id, academicYear, description, rating) =>
										apiClient
											.submitEditedReview(
												id,
												academicYear,
												description,
												rating,
												sessionData?.access_token || ""
											)
											.then((result) => {
												handleSubmitResponse(result);
												return result.color === "green";
											})
											.catch((error) => {
												console.error(error);
												return false;
											})
									}
									onDeleteReview={(id) => {
										apiClient
											.submitDeleteReview(id, sessionData?.access_token || "")
											.then((result) => {
												handleSubmitResponse(result);
											})
											.catch(console.error);
									}}
								/>
							) : (
								<ReviewCard key={`review_card_${review.id}`} review={review} />
							)
						)
					: null}

				{!isLoading && !reviewsData?.data.length && (
					<Center my="md">
						<Text>No reviews for this course</Text>
					</Center>
				)}
				<Center>
					<Pagination total={reviewsData?.totalPages || 1} value={pageNumber} onChange={setPageNumber} />
				</Center>
			</Stack>

			<Divider mt="md" />

			{/* write a review section*/}
			<Title my="md" order={2}>
				Write a Review
			</Title>
			<WriteReviewForm
				courseCode={params.courseCode}
				onSubmit={(academicYear, description, rating) =>
					apiClient
						.submitNewReview(academicYear, description, rating, sessionData?.access_token || "")
						.then((result) => {
							handleSubmitResponse(result);
							return result.color === "green";
						})
						.catch((error) => {
							console.error(error);
							return false;
						})
				}
			/>
		</Container>
	);
}
