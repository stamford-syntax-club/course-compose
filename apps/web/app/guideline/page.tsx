"use client";
import React, { useState } from "react";
import { guideline, aspects } from "./data";
import { Container, Text, Title, Button, Group, Collapse, Box, List, Flex, Center } from "@mantine/core";
import { IconBook, IconKey, IconCirclePlus, IconOctagonMinus, IconChecklist } from "@tabler/icons-react";
import { Span } from "next/dist/trace";

export default function Guideline(): JSX.Element {
	const [openedIndex, setOpenedIndex] = useState<number | null>(null);

	const toggleCollapse = (index: number) => {
		setOpenedIndex(openedIndex === index ? null : index);
	};

	return (
		<Container>
			<Box mx="auto" px={4} py={5} maw={"896px"}>
				<Flex gap="md" wrap="wrap" direction="column" mb="xl">
					<Group wrap="nowrap" justify="center" align="center" mb="sm">
						<IconBook size={26} className=" flex flex-shrink-0" />
						<Title fw={700} className="text-center text-[20px] md:text-[25px]">
							Guidelines for Writing Course Reviews
						</Title>
						<IconBook size={26} className=" flex flex-shrink-0" />
					</Group>
					<Text c="dimmed">
						While reviews are helpful, always consult with your academic advisors when selecting courses.
						This platform is intended to supplement their guidance with student experiences. Remember that
						reading reviews is useful, but you must study according to your curriculum and requirements.
					</Text>
				</Flex>

				<Flex gap="lg" direction="column" wrap="wrap" mb="xl">
					<Group wrap="nowrap" justify="center" align="center" mb="sm">
						<IconKey size={26} className=" flex flex-shrink-0" />
						<Title fw={700} className="text-center text-[20px] md:text-[25px]">
							Consider Key Aspect of the course
						</Title>
						<IconKey size={26} className=" flex flex-shrink-0" />
					</Group>

					{aspects?.map((info, index) => (
						<Box key={index}>
							<Title order={4} fw={700} mb="md" className="flex items-center">
								<IconChecklist className="mr-2" color="#44b8d5" size={24} />
								{info.title}
							</Title>
							<Text c="dimmed">{info.info}</Text>
						</Box>
					))}
				</Flex>

				{guideline?.map((list, index: number) => (
					<Box maw={960} key={index}>
						<Group mb={5}>
							<Button
								justify="space-between"
								onClick={() => toggleCollapse(index)}
								color="gray"
								fullWidth
								mb={12}
								size="md"
								variant="light"
								rightSection={openedIndex == index ? <IconOctagonMinus /> : <IconCirclePlus />}
							>
								{list.title}
							</Button>
						</Group>
						<Collapse in={openedIndex === index} transitionDuration={300} transitionTimingFunction="linear">
							<List pb="md" c="dimmed">
								{list.rule1 && <List.Item>{list.rule1}</List.Item>}
								{list.rule2 && <List.Item>{list.rule2}</List.Item>}
								{list.rule3 && <List.Item>{list.rule3}</List.Item>}
								{list.rule4 && <List.Item>{list.rule4}</List.Item>}
							</List>
						</Collapse>
					</Box>
				))}
			</Box>
		</Container>
	);
}
