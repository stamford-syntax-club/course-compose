import { Avatar, Badge, Box, Button, Card, Flex, Menu, Rating, Text } from "@mantine/core";
import { IconEdit, IconMenu2, IconThumbDown, IconThumbUp, IconX } from "@tabler/icons-react";
import { Review } from "types/reviews";

interface ReviewCardProps {
	review: Review;
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
		<Card padding="md" radius="md">
			<Flex direction="row" gap="lg" justify="center">
				{/* user profile and badges */}
				<Flex direction="column" align="center" gap="4" justify="center" className="max-w-sm text-center">
					<Box component="a" href="/">
						<Avatar size="70" src={null} alt="no image here" />
					</Box>
					<Box>
						<Text>Anonymous</Text>
					</Box>
				</Flex>

				{/* review and ratings */}
				<Flex direction="column" justify="flex-start" ml="3" gap="4" w="100%">
					<Rating size="md" value={review.rating} fractions={2} defaultValue={0} readOnly />
					<Text size="sm">Academic Year: {review.academicYear}</Text>
					<Box>
						<Text mt="md">{review.description}</Text>
					</Box>
				</Flex>

				<Flex direction="column" gap="lg" align="center">
					<Box className="flex flex-col">
						<Button color="green" variant="light">
							<IconThumbUp />
						</Button>
						<Text className="self-center">{review.votes}</Text>
						<Button color="red" variant="light">
							<IconThumbDown />
						</Button>
					</Box>
				</Flex>
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
					<Box component="a" href="/">
						<Avatar size="70" src={null} alt="no image here" />
					</Box>
					<Box>
						<Text>You</Text>
					</Box>
				</Flex>

				{/* review and ratings */}
				<Flex direction="column" justify="flex-start" ml="3" gap="4" w="100%">
					<Rating size="md" value={review.rating} fractions={2} defaultValue={0} readOnly />
					<Text size="sm">Academic Year: {review.academicYear}</Text>
					<Box>
						<Text mt="md">{review.description}</Text>
					</Box>
				</Flex>

				<Flex direction="column" gap="4">
					<Flex direction="row" gap="4">
						<Badge color={getStatusColor(review.status)}>{review.status}</Badge>
						<Menu>
							<Menu.Target>
								<IconMenu2 />
							</Menu.Target>

							<Menu.Dropdown>
								<Menu.Item leftSection={<IconEdit />}>Edit Review</Menu.Item>
								<Menu.Item leftSection={<IconX />} className="text-red-500">
									Delete Review
								</Menu.Item>
							</Menu.Dropdown>
						</Menu>
					</Flex>

					<Flex justify="center">
						<Button color={review.votes > 0 ? "green" : "red"} variant="light">
							{review.votes > 0 ? <IconThumbUp /> : <IconThumbDown />}
						</Button>
						<Text className="self-center">{review.votes}</Text>
					</Flex>
				</Flex>
			</Flex>
		</Card>
	);
}
