import { Button, Card, Flex, Group, Image, Rating, Stack, Text } from "@mantine/core";
import { limitWords } from "@utils/limit-text";
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

					<Group>
						{limitWords(
							"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. In pellentesque massa placerat duis ultricies lacus sed.",
							20
						)}
					</Group>

					<Group className="mt-auto w-full" justify="flex-end" gap="xs">
						<Button bg="blue.4">{"SEE MY REVIEW".toUpperCase()}</Button>
					</Group>
				</Stack>
			</Card>
		</div>
	);
}
