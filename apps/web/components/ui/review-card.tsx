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
	Button,
	TypographyStylesProvider
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconEdit, IconDots, IconX } from "@tabler/icons-react";
import ReactMarkdown from "react-markdown";
import type { Review } from "types/reviews";
import WriteReviewForm from "./write-review-form";

interface ReviewCardProps {
	review: Review;
	onEditReview?: (
		id: number,
		section: string,
		term: string,
		academicYear: string,
		description: string,
		rating: number
	) => void;
	onDeleteReview?: (id: number) => void;
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

//in case the desciption contian no space, to break long words
const breakLongWords = (text: string, maxLength: number = 18): string => {
	return text
		.split(" ")
		.map((word) => {
			if (word.length > maxLength) {
				return word.match(new RegExp(".{1," + maxLength + "}", "g"))?.join(" ") ?? word;
			}
			return word;
		})
		.join(" ");
};

export function ReviewCard({ review }: ReviewCardProps): JSX.Element {
	const formattedDescription = breakLongWords(review.description);

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
							<ReactMarkdown>{formattedDescription}</ReactMarkdown>
						</TypographyStylesProvider>
					</Spoiler>
				</Flex>

				{/* TODO: like and dislike button */}
			</Flex>
		</Card>
	);
}

export function MyReviewCard({ review, onEditReview, onDeleteReview }: ReviewCardProps): JSX.Element {
	const [openedEdit, { open: openEdit, close: closeEdit }] = useDisclosure(false);
	const [openedDelete, { open: openDelete, close: closeDelete }] = useDisclosure(false);

	const formattedDescription = breakLongWords(review.description);

	return (
		<>
			<Card
				bg="gray.9"
				padding="md"
				radius="md"
				withBorder
				className={`border-${getStatusColor(review.status)}-500 break-words`}
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
								<Text>
									<b>Reason for rejection:</b> {review.rejectedReason}
								</Text>
							</Blockquote>
						)}

						<Rating size="md" value={review.rating} fractions={2} defaultValue={0} readOnly />
						<Text fw={800} size="md">
							Academic Year: {review.academicYear}
						</Text>
						<Spoiler maxHeight={75} showLabel="Show more" hideLabel="Hide">
							<TypographyStylesProvider mt="sm">
								<ReactMarkdown>{formattedDescription}</ReactMarkdown>
							</TypographyStylesProvider>
						</Spoiler>
					</Flex>
					<Menu>
						<Menu.Target>
							<IconDots />
						</Menu.Target>

						<Menu.Dropdown>
							<Menu.Item leftSection={<IconEdit />} onClick={openEdit}>
								Edit Review
							</Menu.Item>
							<Menu.Item leftSection={<IconX />} onClick={openDelete} className="text-red-500">
								Delete Review
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				</Flex>
			</Card>

			{/* Modal Edit Form */}
			<Modal
				opened={openedEdit}
				onClose={closeEdit}
				title="Editing Review"
				centered
				overlayProps={{
					backgroundOpacity: 0.55,
					blur: 3
				}}
			>
				{/* Modal content */}
				<WriteReviewForm
					onSubmit={(section, term, academicYear, description, rating) => {
						// when user submit their edited review
						if (onEditReview) onEditReview(review.id, section, term, academicYear, description, rating);
						closeEdit();
						return Promise.resolve(true);
					}}
					previousReview={review}
				/>
			</Modal>

			{/* Modal Delete Form */}
			<Modal
				opened={openedDelete}
				onClose={closeDelete}
				title="Delete Review"
				centered
				overlayProps={{
					backgroundOpacity: 0.55,
					blur: 3
				}}
			>
				{/* Modal content */}
				<Text mb="sm" className="text-center">
					Are you sure you want to delete your review?
				</Text>
				<Flex justify="center" gap="sm">
					<Button
						color="red"
						onClick={() => {
							if (onDeleteReview) onDeleteReview(review.id);
							closeDelete();
						}}
					>
						{/* <IconTrash className="mr-1" /> */}
						Yes, delete review
					</Button>
					<Button onClick={closeDelete}>
						{/* <IconX className="mr-1" /> */}
						No, take me back
					</Button>
				</Flex>
			</Modal>
		</>
	);
}
