"use client";

import { MyReviewCard } from "@components/ui/cards/my-review-card";
import SessionModal from "@components/ui/session-modal";
import { Accordion, Badge, Center, Grid, Loader, Paper, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
	BASE_API_ENDPOINT,
	REVIEW_STATUS_APPROVED,
	REVIEW_STATUS_PENDING,
	REVIEW_STATUS_REJECTED
} from "@utils/constants";
import fetcher from "@utils/fetcher";
import { useAuth } from "hooks/use-auth";
import { useEffect, useState } from "react";
import type { Review } from "types/reviews";
import type { Session } from "@supabase/supabase-js";

export interface AccordionItems {
	value: string;
	posts: Review[];
	severity: string;
}

export default function MyReviews(): JSX.Element {
	const [sessionData, setSessionData] = useState<Session | null>();
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [myReviewsData, setMyReviewsData] = useState<Review[] | []>([]);

	const { getSession } = useAuth();
	const [opened, { open: openSessionModal, close: closeSessionModal }] = useDisclosure(false);

	useEffect(() => {
		if (!sessionData) {
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
		}
	}, [getSession, openSessionModal, sessionData]);

	useEffect(() => {
		if (!sessionData) {
			return;
		}
		setIsLoading(true);

		const fetchMyReviews = async (): Promise<void> => {
			try {
				const results = await fetcher<{ data: Review[] }>(
					`${BASE_API_ENDPOINT}/myreviews`,
					sessionData.access_token || ""
				);

				setMyReviewsData(results.data?.data || []);
			} catch (err) {
				console.error(err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchMyReviews().catch(console.error);
	}, [sessionData]);

	const filteredCourseCards: AccordionItems[] = [
		{
			value: REVIEW_STATUS_APPROVED,
			posts: myReviewsData.filter((item) => item.status === REVIEW_STATUS_APPROVED),
			severity: "green"
		},
		{
			value: REVIEW_STATUS_PENDING,
			posts: myReviewsData.filter((item) => item.status === REVIEW_STATUS_PENDING),
			severity: "gray"
		},
		{
			value: REVIEW_STATUS_REJECTED,
			posts: myReviewsData.filter((item) => item.status === REVIEW_STATUS_REJECTED),
			severity: "red"
		}
	];

	const items = filteredCourseCards.map((item) => (
		<Accordion.Item key={item.value} value={item.value}>
			<Accordion.Control>
				<Badge className="min-w-fit" color={item.severity}>
					{item.value}
				</Badge>
			</Accordion.Control>
			<Accordion.Panel>
				<Stack gap="md">
					<Paper bg="dark.8" p="md" withBorder>
						<div className="relative flex size-full flex-col">
							<div className="grid grid-cols-12 grid-rows-1 gap-6">
								{item.posts.length !== 0 ? (
									item.posts.map((cardItem) => (
										<MyReviewCard key={`CourseCard_${cardItem.course.code}`} cardData={cardItem} />
									))
								) : (
									<Text className="col-span-12 text-center">No {item.value} Posts Yet</Text>
								)}
							</div>
						</div>
					</Paper>
				</Stack>
			</Accordion.Panel>
		</Accordion.Item>
	));

	return (
		<Grid
			className="h-full"
			classNames={{
				inner: "h-full"
			}}
		>
			<Grid.Col span={{ base: 12, xl: 12 }}>
				<SessionModal opened={opened} open={openSessionModal} close={closeSessionModal} />

				{isLoading ? (
					<Center my="md">
						<Loader />
					</Center>
				) : null}

				<Accordion
					multiple
					radius="xs"
					defaultValue={[REVIEW_STATUS_APPROVED, REVIEW_STATUS_PENDING, REVIEW_STATUS_REJECTED]}
				>
					{items}
				</Accordion>
			</Grid.Col>
		</Grid>
	);
}
