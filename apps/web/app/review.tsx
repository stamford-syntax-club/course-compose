import {
	Card,
	Container,
	Title,
	Text,
	Flex,
	Image,
	Box,
	Stack,
	Group,
	Rating,
	ScrollArea,
	Blockquote,
	Paper,
	Select,
	Textarea,
	Button
} from "@mantine/core";
import UserReview from "../components/ui/review-card";

const CourseReview = () => {
	const academicYears = [
		{ value: "2020-2021", label: "2020-2021" },
		{ value: "2021-2022", label: "2021-2022" }
		//academic years here
	];

	return (
		<Container fluid>
			{/* headings */}
			<Flex direction="row" gap="md" justify="flex-start" mb="lg">
				<Card shadow="sm" padding="md" radius="md" w="100%">
					<Flex direction="row" gap="5">
						<Box component="a" href="/">
							<Image
								h="auto"
								w={300}
								src="/assets/images/logos/stamford-logo-clearbg-white.png"
								alt="Stamford Internation University logo"
							/>
						</Box>
						<Box component="a" href="/">
							<Image
								h={90}
								w={90}
								src="/assets/images/logos/codelogo.png"
								alt="Stamford Internation University logo"
								className="rounded-full"
							/>
						</Box>
					</Flex>
					<Title>Programming 1</Title>
					<Text>Information Technology</Text>
					<Text>ITE221</Text>
				</Card>

				<Card shadow="sm" padding="md" radius="md" w="100%">
					<Title>Related Courses</Title>
					<Text>ITE222 - Programming 2</Text>
					<Text>ITE343 - Mobile Application Development</Text>
				</Card>
			</Flex>
			{/* reviews and ratings */}
			<Box className="rounded-lg border-2 border-solid border-gray-500 p-2">
				<Flex justify="space-between" m="lg" mb="lg">
					<Title>Reviews</Title>
					<Group>
						<Rating value={3.5} fractions={2} size="xl" readOnly />
						<Title>Rating: 4.5</Title>
						<Title>Reviews: 100</Title>
					</Group>
				</Flex>

				{/* instead of scrollarea we can  have page numbers */}
				<ScrollArea h={500} type="always">
					<Stack gap="sm">
						<UserReview
						// userImage="img path here"
						// userName="username here"
						// rating=P{ratings here}
						// date="date format here"
						// description="review text here"
						/>
						<UserReview
						// userImage="img path here"
						// userName="username here"
						// rating=P{ratings here}
						// date="date format here"
						// description="review text here"
						/>
						<UserReview
						// userImage="img path here"
						// userName="username here"
						// rating=P{ratings here}
						// date="date format here"
						// description="review text here"
						/>
						<UserReview
						// userImage="img path here"
						// userName="username here"
						// rating=P{ratings here}
						// date="date format here"
						// description="review text here"
						/>
					</Stack>
				</ScrollArea>
			</Box>

			{/* write reviews */}
			<Box className="mt-5 w-full rounded-lg border-2 border-solid border-gray-500 p-2">
				<Flex justify="center">
					<Blockquote color="red" cite="– Forrest Gump" icon={"Icon"} mt="xl" w="100%" p="sm">
						Life is like an npm install – you never know what you are going to get.
					</Blockquote>
				</Flex>

				<Box>
					<Box className="flex w-full justify-between p-4">
						<Title order={2}>Write a Review</Title>
						<Rating size="lg" defaultValue={0} fractions={2} />
						<Select data={academicYears} placeholder="Select academic year" />
					</Box>
					<Group>
						<Paper p="md" shadow="xs" w="100%" h="100%">
							<Textarea
								placeholder="Write your review here..."
								minRows={15}
								maxRows={20}
								h="100%"
								mt="md"
								autosize
								className="h-full min-h-80 w-full"
							/>
							<Flex gap="sm" justify="end">
								<Button mt="md">Submit</Button>
								<Button mt="md" variant="light">
									Cancel
								</Button>
							</Flex>
						</Paper>
					</Group>
				</Box>
			</Box>
		</Container>
	);
};
export default CourseReview;
