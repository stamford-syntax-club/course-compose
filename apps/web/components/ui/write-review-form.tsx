import { Box, Blockquote, Button, Flex, Rating, Paper, Select, Text } from "@mantine/core";
import { MarkdownEditor } from "@components/ui/markdown-editor";
import { IconAlertCircle, IconAlertTriangle } from "@tabler/icons-react";
import { useState } from "react";
import { useEditor } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { notifications } from "@mantine/notifications";

const academicYearOptions = [
	{ value: "2020", label: "2020" },
	{ value: "2021", label: "2021" },
	{ value: "2022", label: "2022" },
	{ value: "2023", label: "2023" },
	{ value: "2024", label: "2024" }
];

const reviewGuidelines = [
	{
		text: "Your review will be displayed anonymously to the public after approved",
		color: "blue",
		displayIcon: <IconAlertCircle size={25} />
	},
	{
		text: "Kindly refrain from mentioning names and write your reviews with respect. Constructive criticism is encouraged",
		color: "yellow",
		displayIcon: <IconAlertTriangle size={25} />
	}
];

interface WriteReviewFormProps {
	onSubmitCallBack: (academicYear: string, description: string, rating: number) => void;
	initialValues?: {
		academicYear: string;
		description: string;
		rating: number;
	};
}

export default function WriteReviewForm({ onSubmitCallBack, initialValues }: WriteReviewFormProps) {
	const [academicYear, setAcademicYear] = useState<string>(initialValues?.academicYear || "");
	const [rating, setRating] = useState(initialValues?.rating || 0);
	const markdownEditor = useEditor({
		extensions: [
			StarterKit,
			Markdown,
			Placeholder.configure({
				placeholder:
					"Tell us how did you feel about the course. Do you have any suggestions for other students?"
			})
		],
		content: initialValues?.description || "",
	});

	return (
		<Box
			component="form"
			onSubmit={(e) => {
				e.preventDefault();
				if (!academicYear || !markdownEditor?.storage.markdown.getMarkdown() || !rating) {
					notifications.show({
						title: "Hold on! Your review still contains some missing fields",
						color: "red",
						message:
							"Make sure you have filled all the fields such as academic year, ratings, and review descriptions",
						autoClose: 5000
					});
					return;
				}

				onSubmitCallBack(academicYear, markdownEditor?.storage.markdown.getMarkdown(), rating);
			}}
		>
			{reviewGuidelines.map((guide) => (
				<Blockquote key={`"review_guideline_${guide.text}`} color={guide.color} w="100%" p="sm" mb="xs">
					<Flex justify="flex-start" gap="sm">
						{guide.displayIcon}
						<Text>{guide.text}</Text>
					</Flex>
				</Blockquote>
			))}

			<Paper w="100%" h="100%">
				<Flex direction="row" gap="sm" my="sm">
					<Select
						data={academicYearOptions}
						value={academicYear}
						onChange={(value) => setAcademicYear(value || "")}
						placeholder="Select Academic year"
					/>
					<Rating size="lg" defaultValue={0} fractions={2} value={rating} onChange={setRating} />
				</Flex>

				<MarkdownEditor editor={markdownEditor} />

				<Flex gap="sm" justify="end">
					<Button variant="outline" type="submit" my="sm">
						Submit Review
					</Button>
				</Flex>
			</Paper>
		</Box>
	);
}
