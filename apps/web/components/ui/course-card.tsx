import { Badge, Button, Card, Group, Rating, Stack, Text } from "@mantine/core";

interface CourseCardProps {
	courseName: string;
	courseCode: string;
	coursePrerequisites?: string[];
	courseRating: number;
	courseReviewCount: number;
}

export function CourseCard({
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
				className="h-52 shadow-sm transition-colors duration-150 hover:border-white"
				padding="lg"
				radius="md"
				withBorder
			>
				<Stack className="h-full" gap="xs">
					<Group wrap="nowrap">
						<Badge className="min-w-fit" color="blue">
							IT
						</Badge>

						<Text title={courseName} component="div" truncate="end">
							{courseName}
						</Text>

						<Text
							fz={{
								base: "sm",
								sm: "md"
							}}
						>
							<Text span c="dimmed" inherit>
								({courseCode})
							</Text>
						</Text>
					</Group>

					<Text truncate="end" title={coursePreReqString} c="dimmed">
						{coursePreReqString}
					</Text>

					<Group gap="xs">
						<Rating value={courseRating} fractions={2} readOnly />
						<Text>
							{courseRating} ({courseReviewCount})
						</Text>
					</Group>

					<Group className="mt-auto" justify="flex-end" gap="xs">
						<Button variant="outline">View</Button>
						<Button>Review</Button>
					</Group>
				</Stack>
			</Card>
		</div>
	);
}
