import { Button, Card, Flex, Group, Image, Rating, Stack, Text } from "@mantine/core";
import { IconArrowDown, IconArrowUp } from "@tabler/icons-react";

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
				bg="dark.7"
				className="bg-transparent shadow-sm transition-colors duration-150 hover:border-gray-400"
				padding="md"
				radius="md"
				withBorder
			>
				<Stack className="h-full" gap="xs">
					<Group style={{ padding: "10px", borderRadius: "8px" }} bg="dark.6">
						<Stack gap="0" className="w-full">
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
					</Group>

					<Flex gap="xs" align="center" justify="space-between">
						<Rating value={courseRating} fractions={2} readOnly />
						<Flex gap="5px" align="center">
							<IconArrowUp color="green" strokeWidth={3} />
							30
							<IconArrowDown opacity={0.7} color="red" strokeWidth={3} />
							40
						</Flex>
					</Flex>

					<Text truncate="end">
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Unde provident eos fugiat id
						necessitatibus magni ducimus molestias. Placeat, consequatur. Quisquam, quae magnam perspiciatis
						excepturi iste sint itaque sunt laborum. Nihil?
					</Text>

					<Group className="mt-auto w-full" justify="flex-end" gap="xs">
						<Button bg="blue.4">{"SEE MY REVIEW".toUpperCase()}</Button>
					</Group>
				</Stack>
			</Card>
		</div>
	);
}
