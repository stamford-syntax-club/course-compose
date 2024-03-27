"use client";

import { MyReviewCard } from "@components/ui/cards/my-review-card";
import { Accordion, Badge, Grid, Paper, Stack, Text } from "@mantine/core";
import type { AccordionItems, MyReviewCardProps } from "types";

const MY_COURSE_REVIEW_LIST = [
	{
		courseName: "Basic Mathematics",
		courseCode: "MAT101",
		coursePrerequisites: [],
		courseRating: 4.0,
		courseReviewCount: 20,
		status: "Approved"
	},
	{
		courseName: "Advanced Programming",
		courseCode: "CSE302",
		coursePrerequisites: ["CSE201", "CSE202"],
		courseRating: 4.5,
		courseReviewCount: 50,
		status: "Approved"
	},
	{
		courseName: "Modern Web Development",
		courseCode: "WEB403",
		coursePrerequisites: ["WEB301", "WEB302"],
		courseRating: 5.0,
		courseReviewCount: 150,
		status: "Approved"
	},
	{
		courseName: "Emerging Technologies",
		courseCode: "TECH110",
		coursePrerequisites: ["TECH100"],
		courseRating: 0,
		courseReviewCount: 0,
		status: "Approved"
	},
	{
		courseName: "Comprehensive Study of Theoretical and Applied Quantum Computing",
		courseCode: "QTCMP999",
		coursePrerequisites: ["QTCMP500", "PHY400"],
		courseRating: 3.8,
		courseReviewCount: 30,
		status: "Rejected"
	},
	{
		courseName: "Introduction to Philosophy",
		courseCode: "PHI101",
		coursePrerequisites: ["PHI100"],
		courseRating: 2.0,
		courseReviewCount: 5,
		status: "Rejected"
	},
	{
		courseName: "History & Culture: 1900's",
		courseCode: "HIS200",
		coursePrerequisites: ["HIS100"],
		courseRating: 3.5,
		courseReviewCount: 25,
		status: "Approved"
	}
];

const approvedPosts: MyReviewCardProps[] = MY_COURSE_REVIEW_LIST.filter((item) => item.status === "Approved");
const pendingPosts: MyReviewCardProps[] = MY_COURSE_REVIEW_LIST.filter((item) => item.status === "Pending");
const rejectedPosts: MyReviewCardProps[] = MY_COURSE_REVIEW_LIST.filter((item) => item.status === "Rejected");

const filteredCourseCards: AccordionItems[] = [
	{
		value: "Approved",
		status: () => (
			<Badge className="min-w-fit" color="green">
				Approved
			</Badge>
		),
		posts: approvedPosts
	},
	{
		value: "Pending",
		status: () => (
			<Badge className="min-w-fit" color="gray">
				Pending
			</Badge>
		),
		posts: pendingPosts
	},
	{
		value: "Rejected",
		status: () => (
			<Badge className="min-w-fit" color="red">
				Rejected
			</Badge>
		),
		posts: rejectedPosts
	}
];

export default function MyReviews(): JSX.Element {
	const items = filteredCourseCards.map((item) => (
		<Accordion.Item key={item.value} value={item.value}>
			<Accordion.Control>{item.status()}</Accordion.Control>
			<Accordion.Panel>
				<Stack gap="md">
					<Paper bg="dark.8" p="md" withBorder>
						<div className="relative flex size-full flex-col">
							<div className="grid grid-cols-12 grid-rows-1 gap-6">
								{item.posts.length !== 0 ? (
									item.posts.map((course) => (
										<MyReviewCard
											key={`CourseCard_${course.courseCode}`}
											courseName={course.courseName}
											courseCode={course.courseCode}
											coursePrerequisites={course.coursePrerequisites}
											courseRating={course.courseRating}
											courseReviewCount={course.courseReviewCount}
										/>
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
				<Accordion multiple radius="xs" defaultValue={["Approved", "Pending", "Rejected"]}>
					{items}
				</Accordion>
			</Grid.Col>
		</Grid>
	);
}
