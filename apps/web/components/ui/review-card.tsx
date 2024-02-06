import { Card, Flex, Avatar, Box, Text, Rating, Badge, Button } from "@mantine/core";

const UserReview = () => {
	return (
		<Card padding="md" radius="md">
			<Flex direction="row" gap="lg" justify="center">
				{/* user profile and badges */}
				<Flex direction="column" align="center" gap="4" justify="center" className="max-w-sm text-center">
					<Box component="a" href="/">
						<Avatar size="70" src={null} alt="no image here" />
					</Box>
					<Box>
						<Text>{"Annoymous"}</Text>
					</Box>
					<Box className="flex max-w-xs flex-row flex-wrap justify-center">
						{/* These will be small icons */}
						<Badge color="blue" m="2">
							Icons
						</Badge>
						<Badge color="red" m="2">
							Icons
						</Badge>
						<Badge color="orange" m="2">
							Icons
						</Badge>
						<Badge color="green" m="2">
							Icons
						</Badge>
					</Box>
				</Flex>

				{/* review and ratings */}
				<Flex direction="column" justify="flex-start" ml="3" gap="4" w="100%">
					<Rating size="md" value={4} fractions={2} defaultValue={0} readOnly />
					<Text size="sm">Academic Date</Text>
					<Box>
						<Text mt="md">
							Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo numquam amet sit! Totam id
							deleniti expedita quidem vitae soluta hic, natus distinctio rerum consequatur necessitatibus
							molestiae fugiat, nulla quam temporibus.
						</Text>
					</Box>
				</Flex>

				<Flex direction="column" gap="lg" align="center">
					<Badge color="yellow">Pending</Badge>
					<Box className="flex flex-col">
						<Button radius="50" color="green" variant="light">
							Helpful
						</Button>
						<Text className="self-center">{"5"}</Text>
						<Button radius="50" color="red" variant="light">
							UnHelpful
						</Button>
					</Box>
				</Flex>
			</Flex>
		</Card>
	);
};

export default UserReview;
