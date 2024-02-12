import { Avatar, Badge, Box, Button, Card, Flex, Rating, Text } from "@mantine/core";
import { IconThumbDown, IconThumbUp } from "@tabler/icons-react";

interface ReviewCardProps {
	academicYear: number;
	description: string;
	isOwner: boolean;
	rating: number;
	status: string;
	votes: number;
	createdAt: Date;
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

export function UserReview({ academicYear, description, isOwner, rating, status, votes, createdAt }: ReviewCardProps) {
	console.log(description, isOwner);
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
					<Rating size="md" value={rating} fractions={2} defaultValue={0} readOnly />
					<Text size="sm">Academic Year: {academicYear}</Text>
					<Box>
						<Text mt="md">{description}</Text>
					</Box>
				</Flex>

				<Flex direction="column" gap="lg" align="center">
					{/* only display pending if "isOwner" is true */}
					{isOwner ? <Badge color={getStatusColor(status)}>{status}</Badge> : null}

					<Box className="flex flex-col">
						<Button radius="50" color="green" variant="light">
							<IconThumbUp />
						</Button>
						<Text className="self-center">{votes}</Text>
						<Button radius="50" color="red" variant="light">
							<IconThumbDown />
						</Button>
					</Box>
				</Flex>
			</Flex>
		</Card>
	);
}

export default UserReview;
