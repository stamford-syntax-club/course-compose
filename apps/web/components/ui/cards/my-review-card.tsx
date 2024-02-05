import { Button, Card, Group, Rating, Stack, Text } from "@mantine/core";

interface CourseCardProps {
	courseName: string;
	courseCode: string;
	coursePrerequisites?: string[];
	courseRating: number;
	courseReviewCount: number;
}

export function MyReviewCard({
	courseName,
	courseCode,
	coursePrerequisites = [],
	courseRating,
	courseReviewCount
}: CourseCardProps): JSX.Element {
	const coursePreReqString =
		coursePrerequisites.length > 0 ? `Pre: ${coursePrerequisites.join(", ")}` : "No Prerequisites";

	return (
		// base: 12, sm: 6, xl: 4
		<div className="col-span-12 sm:col-span-6 xl:col-span-4">
			<Card
				bg="blue"
				className="bg-transparent shadow-sm transition-colors duration-150 hover:border-gray-400"
				padding="md"
				radius="md"
				withBorder
			>
				<Stack className="h-full" gap="xs">
					<Stack gap="0">
						<Text span c="dimmed" inherit>
							{courseCode}
						</Text>
						<Text title={courseName} component="div" truncate="end">
							{courseName}
						</Text>
						<Text truncate="end" title={coursePreReqString} c="dimmed">
							{coursePreReqString}
						</Text>
					</Stack>

					<Group gap="xs">
						<Rating value={courseRating} fractions={2} readOnly />
						{/* <Text>
							{courseRating} ({courseReviewCount})
						</Text> */}
					</Group>

					<Group className="mt-auto w-full" justify="flex-end" gap="xs">
						<Button>GO TO MY REVIEW</Button>
					</Group>
				</Stack>
			</Card>
		</div>
	);
}
