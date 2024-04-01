"use client";

import { MyReviewCard } from "@components/ui/cards/my-review-card";
import SessionModal from "@components/ui/session-modal";
import { Accordion, Badge, Center, Grid, Loader, Paper, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { APPROVED, BASE_API_ENDPOINT, PENDING, REJECTED } from "@utils/constants";
import fetcher from "@utils/fetcher";
import { useAuth } from "hooks/use-auth";
import { useEffect, useState } from "react";
import type { AccordionItems, MyReviewsData } from "types";
import type { Session } from "@supabase/supabase-js";

const initialEmptyPosts: MyReviewsData[] = [];

export default function MyReviews(): JSX.Element {
	const [sessionData, setSessionData] = useState<Session | null>();
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [myReviewsData, setMyReviewsData] = useState<MyReviewsData[] | null>([]);

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
				const results = await fetcher<{ data: MyReviewsData[] }>(
					`${BASE_API_ENDPOINT}/myreviews`,
					sessionData.access_token || ""
				);

				setMyReviewsData(results.data || []);
			} catch (err) {
				console.error(err);
				// Handle error here
			} finally {
				setIsLoading(false);
			}
		};

		fetchMyReviews().catch(console.error);
	}, [sessionData]);

	const approvedPosts: MyReviewsData[] = myReviewsData
		? myReviewsData.filter((item) => item.status === APPROVED)
		: initialEmptyPosts;
	const pendingPosts: MyReviewsData[] = myReviewsData
		? myReviewsData.filter((item) => item.status === PENDING)
		: initialEmptyPosts;
	const rejectedPosts: MyReviewsData[] = myReviewsData
		? myReviewsData.filter((item) => item.status === REJECTED)
		: initialEmptyPosts;

	const filteredCourseCards: AccordionItems[] = [
		{
			value: APPROVED,
			posts: approvedPosts.length !== 0 ? approvedPosts : []
		},
		{
			value: PENDING,
			posts: pendingPosts.length !== 0 ? pendingPosts : []
		},
		{
			value: REJECTED,
			posts: rejectedPosts.length !== 0 ? rejectedPosts : []
		}
	];

	const items = filteredCourseCards.map((item) => (
		<Accordion.Item key={item.value} value={item.value}>
			<Accordion.Control>
				<Badge className="min-w-fit" color="gray">
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
			className="mx-auto h-full w-[1000px]"
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

				<Accordion multiple radius="xs" defaultValue={[APPROVED, PENDING, REJECTED]}>
					{items}
				</Accordion>
			</Grid.Col>
		</Grid>
	);
}
