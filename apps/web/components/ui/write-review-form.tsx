import { useState, useEffect, useMemo } from "react";
import { Box, Blockquote, Button, Flex, Rating, Paper, Select, Text } from "@mantine/core";
import { IconAlertCircle, IconAlertTriangle } from "@tabler/icons-react";
import { useEditor } from "@tiptap/react";
import { Placeholder } from "@tiptap/extension-placeholder";
import { StarterKit } from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { notifications } from "@mantine/notifications";
import { MarkdownEditor } from "@components/ui/markdown-editor";
import type { Review } from "types/reviews";
import Link from "next/link";

const academicYearOptions = [
	{ value: "2020", label: "2020" },
	{ value: "2021", label: "2021" },
	{ value: "2022", label: "2022" },
	{ value: "2023", label: "2023" },
	{ value: "2024", label: "2024" }
];

interface WriteReviewFormProps {
	courseCode?: string;
	onSubmit: (academicYear: string, description: string, rating: number) => Promise<boolean>;
	previousReview?: Review;
}

const reviewGuidelines = [
	{
		text: "Your review will be displayed anonymously to the public after approval.",
		color: "blue",
		displayIcon: <IconAlertCircle size={25} />
	},
	{
		text: "Kindly refrain from mentioning names and write your reviews with respect. Constructive criticism is encouraged.",
		color: "yellow",
		displayIcon: <IconAlertTriangle size={25} />
	}
];

// Keys for local storage
const reviewFormKeys = (courseCode: string) => ({
	academicYearKey: `reviewFormAcademicYear_${courseCode}`,
	ratingKey: `reviewFormRating_${courseCode}`,
	descriptionKey: `reviewFormDescription_${courseCode}`
});

export default function WriteReviewForm({ courseCode, onSubmit, previousReview }: WriteReviewFormProps) {
	const reviewKeys = useMemo(() => reviewFormKeys(courseCode || ""), [courseCode]);
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

	const resetForm = () => {
		setAcademicYear(null);
		setRating(0);
		markdownEditor?.commands.setContent("");
	};

	useEffect(() => {
		if (!previousReview) {
			const savedAcademicYear = localStorage.getItem(reviewKeys.academicYearKey);
			const savedRating = localStorage.getItem(reviewKeys.ratingKey);
			const savedDescription = localStorage.getItem(reviewKeys.descriptionKey);

			if (savedAcademicYear) setAcademicYear(savedAcademicYear);
			if (savedRating) setRating(parseFloat(savedRating));
			if (savedDescription && markdownEditor) markdownEditor.commands.setContent(savedDescription);
		}
	}, [previousReview, markdownEditor, reviewKeys]);

	useEffect(() => {
		if (rating) localStorage.setItem(reviewKeys.ratingKey, rating.toString());
		if (academicYear) localStorage.setItem(reviewKeys.academicYearKey, academicYear);
		if (markdownEditor) {
			const saveMarkdown = () => {
				localStorage.setItem(reviewKeys.descriptionKey, markdownEditor.storage.markdown.getMarkdown());
			};
			markdownEditor.on("update", saveMarkdown);
			return () => {
				markdownEditor.off("update", saveMarkdown);
			};
		}
	}, [markdownEditor, academicYear, reviewKeys, rating]);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
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

		onSubmit(academicYear, currentDescription, rating).then((success) => {
			if (success) {
				resetForm();
				localStorage.removeItem(reviewKeys.academicYearKey);
				localStorage.removeItem(reviewKeys.ratingKey);
				localStorage.removeItem(reviewKeys.descriptionKey);
			}
		});
	};

	return (
		<Box component="form" onSubmit={handleSubmit}>
			{reviewGuidelines.map((guide) => (
				<Blockquote key={`review_guideline_${guide.text}`} color={guide.color} w="100%" p="sm" mb="xs">
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

				<Flex gap="sm" justify="space-between">
					<Link href="/guideline">
						<Button my="sm" variant="outline">
							Review Guidelines
						</Button>
					</Link>

					<Button type="submit" my="sm">
						Submit Review
					</Button>
				</Flex>
			</Paper>
		</Box>
	);
}
