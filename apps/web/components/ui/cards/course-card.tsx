/* eslint-disable camelcase -- incoming data might be in snake_case */
import {  Button, Card, Group, Rating, Stack, Text } from "@mantine/core";
import { IconBook } from "@tabler/icons-react";
import Link from "next/link";

import type { Course } from "types/course";

export function CourseCard({
	full_name,
	code,
	prerequisites = [],
	overall_ratings,
	reviews_count
}: Course): JSX.Element {
	const coursePreReqString = prerequisites.length > 0 ? `Pre: ${prerequisites.join(", ")}` : "No Prerequisites";

	return (
		<div className="col-span-12 sm:col-span-6 xl:col-span-4">
			<Card
				className="h-52 shadow-sm transition-colors duration-150 hover:border-white"
				padding="lg"
				radius="md"
				withBorder
			>
				<Stack className="h-full" gap="xs">
					<Group wrap="nowrap">
						{/* <Badge className="min-w-fit" color="blue">
							IT
						</Badge> */}
						<IconBook className="flex-shrink-0" />

						<Text title={full_name} component="div" truncate="end">
							{full_name}
						</Text>

						<Text
							fz={{
								base: "sm",
								sm: "md"
							}}
						>
							<Text span c="dimmed" inherit>
								({code})
							</Text>
						</Text>
					</Group>

					<Text truncate="end" title={coursePreReqString} c="dimmed">
						{coursePreReqString}
					</Text>

					<Group gap="xs">
						<Rating value={overall_ratings} fractions={2} readOnly />
						<Text>
							{overall_ratings} ({reviews_count})
						</Text>
					</Group>

					<Link href={`/courses/${code}`} passHref className="mt-auto flex justify-end gap-x-2">
						<Button variant="outline">View</Button>
						<Button>Review</Button>
					</Link>
				</Stack>
			</Card>
		</div>
	);
}
