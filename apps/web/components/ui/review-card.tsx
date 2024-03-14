import {
	Avatar,
	Badge,
	Blockquote,
	Card,
	Flex,
	Menu,
	Rating,
	Spoiler,
	Text,
	Modal,
	TypographyStylesProvider
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconEdit, IconDots, IconX } from "@tabler/icons-react";
import ReactMarkdown from "react-markdown";
import { Review } from "types/reviews";
import WriteReviewForm from "./write-review-form";
import { useState } from "react";

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
		<Card radius="md" shadow="sm">
			<Flex direction="row" gap="lg" justify="center">
				{/* user profile and badges */}
				<Flex
					visibleFrom="md"
					direction="column"
					align="center"
					gap="4"
					justify="center"
					className="max-w-sm text-center"
				>
					<Avatar size="70" src={null} alt="anonymous profile" />
					<Text>Anonymous</Text>
				</Flex>

				{/* review and ratings */}
				<Flex direction="column" justify="flex-start" ml="3" gap="4" w="100%">
					<Rating size="md" value={review.rating} fractions={2} defaultValue={0} readOnly />
					<Text fw={800} size="sm">
						Academic Year: {review.academicYear}
					</Text>
					<Spoiler maxHeight={75} showLabel="Show more" hideLabel="Hide">
						<TypographyStylesProvider mt="md">
							<ReactMarkdown>{review.description}</ReactMarkdown>
						</TypographyStylesProvider>
					</Spoiler>
				</Flex>

				{/* TODO: like and dislike button */}
			</Flex>
		</Card>
	);
}

export function MyReviewCard({ review }: ReviewCardProps) {
	const [opened, { open, close }] = useDisclosure(false);
	const [updatedReview, setUpdatedReview] = useState<Review>(review);

	const handleEditReview = () => {
		review = updatedReview ? updatedReview : review;
		open();
	};

	const handleDeleteReview = () => {
		//TODO: implement delete review
		console.log("Delete review");
	};

	return (
		<>
			<Card
				bg="gray.9"
				padding="md"
				radius="md"
				withBorder
				className={`border-${getStatusColor(review.status)}-500`}
			>
				<Flex direction="row" gap="md" justify="center">
					{/* user profile and badges */}
					<Flex
						direction="column"
						align="center"
						gap="4"
						justify="center"
						className="max-w-sm text-center"
						visibleFrom="md"
					>
						<Avatar size="70" src={null} alt="anonymous profile" />
						<Text>You</Text>
						<Badge color={getStatusColor(review.status)}>{review.status}</Badge>
					</Flex>

					{/* review and ratings */}

					<Flex direction="column" justify="flex-start" ml="3" gap="xs" w="100%">
						<Badge color={getStatusColor(review.status)} hiddenFrom="md">
							{review.status}
						</Badge>
						{review.status === "REJECTED" && (
							<Blockquote color="red" w="100%" p="sm" mb="xs">
								<Text><b>Reason for rejection:</b> {review.rejectedReason}</Text>
							</Blockquote>
						)}

						<Rating size="md" value={review.rating} fractions={2} defaultValue={0} readOnly />
						<Text fw={800} size="md">
							Academic Year: {review.academicYear}
						</Text>
						<Spoiler maxHeight={75} showLabel="Show more" hideLabel="Hide">
							<TypographyStylesProvider mt="sm">
								<ReactMarkdown>{review.description}</ReactMarkdown>
							</TypographyStylesProvider>
						</Spoiler>
					</Flex>
					<Menu>
						<Menu.Target>
							<IconDots />
						</Menu.Target>

						<Menu.Dropdown>
							<Menu.Item leftSection={<IconEdit />} onClick={handleEditReview}>
								Edit Review
							</Menu.Item>
							<Menu.Item leftSection={<IconX />} onClick={handleDeleteReview} className="text-red-500">
								Delete Review
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				</Flex>
			</Card>

			{/* Modal Edit Form */}
			<Modal
				opened={opened}
				onClose={close}
				title="Editing Review"
				centered
				overlayProps={{
					backgroundOpacity: 0.55,
					blur: 3
				}}
			>
				{/* Modal content */}
				<WriteReviewForm
					onSubmitCallBack={(academicYear, description, rating) => {
						setUpdatedReview((prevReview) => ({
							...prevReview,
							academicYear,
							description,
							rating
						}));
						close();
					}}
					initialValues={{
						academicYear: updatedReview.academicYear,
						description: updatedReview.description,
						rating: updatedReview.rating
					}}
				/>
			</Modal>
		</>
	);
}
