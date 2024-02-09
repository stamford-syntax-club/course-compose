import { Avatar, Badge, Box, Button, Card, Flex, Rating, Text } from "@mantine/core";
import {  IconThumbUp, IconThumbDown} from "@tabler/icons-react";

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
				</Flex>

				{/* review and ratings */}
				<Flex direction="column" justify="flex-start" ml="3" gap="4" w="100%">
					<Rating size="md" value={4} fractions={2} defaultValue={0} readOnly />
					<Text size="sm">Academic Year</Text>
					<Box>
						<Text mt="md">
							Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo numquam amet sit! Totam id
							deleniti expedita quidem vitae soluta hic, natus distinctio rerum consequatur necessitatibus
							molestiae fugiat, nulla quam temporibus.
						</Text>
					</Box>
				</Flex>

				<Flex direction="column" gap="lg" align="center">
					{/* only display pending if "isOwner" is true */}
					<Badge color="yellow">Pending</Badge>
					<Box className="flex flex-col">
						<Button radius="50" color="green" variant="light">
							<IconThumbUp />
						</Button>
						<Text className="self-center">{"5"}</Text>
						<Button radius="50" color="red" variant="light">
							<IconThumbDown/>
						</Button>
					</Box>
				</Flex>
			</Flex>
		</Card>
	);
};

export default UserReview;
