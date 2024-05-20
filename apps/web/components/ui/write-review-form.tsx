import { Box, Blockquote, Button, Flex, Rating, Paper, Select, Text } from "@mantine/core";
import { MarkdownEditor } from "@components/ui/markdown-editor";
import { IconAlertCircle, IconAlertTriangle } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { useEditor } from "@tiptap/react";
import { Placeholder } from "@tiptap/extension-placeholder";
import { StarterKit } from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { notifications } from "@mantine/notifications";
import type { Review } from "types/reviews";

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
	onSubmit: (academicYear: string, description: string, rating: number) => void;
	previousReview?: Review;
}

export default function WriteReviewForm({ onSubmit, previousReview }: WriteReviewFormProps): JSX.Element {
	const [academicYear, setAcademicYear] = useState<string | null>(previousReview?.academicYear || null);
	const [rating, setRating] = useState(previousReview?.rating || 0);
	const markdownEditor = useEditor({
		extensions: [
			StarterKit,
			Markdown,
			Placeholder.configure({
				placeholder:
					"Tell us how did you feel about the course. Do you have any suggestions for other students?"
			})
		],
		content: previousReview?.description || ""
	});

	useEffect(() => {
		if (!previousReview) {
			const savedAcademicYear = localStorage.getItem("reviewFormAcademicYear");
			const savedRating = localStorage.getItem("reviewFormRating");
			const savedDescription = localStorage.getItem("reviewFormDescription");

			if (savedAcademicYear) setAcademicYear(savedAcademicYear);
			if (savedRating) setRating(parseFloat(savedRating));
			if (savedDescription && markdownEditor) markdownEditor.commands.setContent(savedDescription);
		}
	}, [previousReview, markdownEditor]);

	//to save localStorage when state changes
	useEffect(() => {
		localStorage.setItem("reviewFormRating", rating.toString());
	}, [rating]);

	useEffect(() => {
		if (academicYear) localStorage.setItem("reviewFormAcademicYear", academicYear);
		if (markdownEditor) {
			const saveMarkdown = () => {
				localStorage.setItem("reviewFormDescription", markdownEditor.storage.markdown.getMarkdown());
			};
			markdownEditor.on("update", saveMarkdown);
			return () => {
				markdownEditor.off("update", saveMarkdown);
			};
		}
	}, [markdownEditor, academicYear]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const currentDescription = markdownEditor?.storage.markdown.getMarkdown() || "";
		if (!academicYear || !currentDescription || !rating) {
			notifications.show({
				title: "Hold on! Your review still contains some missing fields",
				color: "red",
				message:
					"Make sure you have filled all the fields such as academic year, ratings, and review descriptions",
				autoClose: 5000
			});
			return;
		}

		onSubmit(academicYear, currentDescription, rating);

		// to remove the local storage
		localStorage.removeItem("reviewFormAcademicYear");
		localStorage.removeItem("reviewFormRating");
		localStorage.removeItem("reviewFormDescription");
	};
	return (
		<Box
			component="form"
			onSubmit={(e) => {
				e.preventDefault();
				handleSubmit(e);
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
						defaultSearchValue={academicYear || undefined}
						onChange={setAcademicYear}
						placeholder="Academic year"
					/>
					<Rating size="lg" defaultValue={0} fractions={2} value={rating} onChange={setRating} />
				</Flex>

				<MarkdownEditor editor={markdownEditor} />

				<Flex gap="sm" justify="end">
					<Button type="submit" my="sm">
						Submit Review
					</Button>
				</Flex>
			</Paper>
		</Box>
	);
}
