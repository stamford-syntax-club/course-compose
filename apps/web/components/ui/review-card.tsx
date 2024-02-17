import { Avatar, Badge, Card, Flex, Menu, Rating, Text, TypographyStylesProvider } from "@mantine/core";
import { IconEdit, IconDots, IconX } from "@tabler/icons-react";
import ReactMarkdown from "react-markdown";
import { Review } from "types/reviews";

interface ReviewCardProps {
	review: Review;
	// TODO: add 2 callbacks: onEditReview, onDeleteReview (only for MyReviewCard)
}

const getStatusColor = (status: string): string => {
	switch (status) {
		case "PENDING":
			return "yellow";
		case "REJECTED":
			return "red";
		default:
			return "green";
	}
};

export function ReviewCard({ review }: ReviewCardProps) {
	return (
		<Card padding="md" radius="md" shadow="sm">
			<Flex direction="row" gap="lg" justify="center">
				{/* user profile and badges */}
				<Flex direction="column" align="center" gap="4" justify="center" className="max-w-sm text-center">
					<Avatar size="70" src={null} alt="anonymous profile" />
					<Text>Anonymous</Text>
				</Flex>

				{/* review and ratings */}
				<Flex direction="column" justify="flex-start" ml="3" gap="4" w="100%">
					<Rating size="md" value={review.rating} fractions={2} defaultValue={0} readOnly />
					<Text fw={800} size="sm">
						Academic Year: {review.academicYear}
					</Text>
					<TypographyStylesProvider mt="md">
						<ReactMarkdown>{review.description}</ReactMarkdown>
					</TypographyStylesProvider>
				</Flex>

				{/* TODO: like and dislike button */}
			</Flex>
		</Card>
	);
}

export function MyReviewCard({ review }: ReviewCardProps) {
	return (
		<Card bg="gray.9" padding="md" radius="md" withBorder>
			<Flex direction="row" gap="md" justify="center">
				{/* user profile and badges */}
				<Flex direction="column" align="center" gap="4" justify="center" className="max-w-sm text-center">
					<Avatar size="70" src={null} alt="anonymous profile" />
					<Text>You</Text>
					<Badge color={getStatusColor(review.status)}>{review.status}</Badge>
				</Flex>

				{/* review and ratings */}
				<Flex direction="column" justify="flex-start" ml="3" gap="4" w="100%">
					<Rating size="md" value={review.rating} fractions={2} defaultValue={0} readOnly />

					<Text fw={800} size="md">
						Academic Year: {review.academicYear}
					</Text>
					<TypographyStylesProvider mt="sm">
						<ReactMarkdown>{review.description}</ReactMarkdown>
					</TypographyStylesProvider>
				</Flex>
				<Menu>
					<Menu.Target>
						<IconDots />
					</Menu.Target>

					<Menu.Dropdown>
						<Menu.Item leftSection={<IconEdit />}>Edit Review</Menu.Item>
						<Menu.Item leftSection={<IconX />} className="text-red-500">
							Delete Review
						</Menu.Item>
					</Menu.Dropdown>
				</Menu>
			</Flex>
		</Card>
	);
}