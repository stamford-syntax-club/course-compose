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
	{ value: "2024", label: "2024" },
	{ value: "2023", label: "2023" },
	{ value: "2022", label: "2022" },
	{ value: "2021", label: "2021" }
];

interface WriteReviewFormProps {
	courseCode?: string;
	onSubmit: (academicYear: string, description: string, rating: number) => Promise<boolean>;
	previousReview?: Review;
}

const reviewGuidelines = [
	{
		text: <Text>Your review will be displayed anonymously to the public after approval.</Text>,
		color: "blue",
		displayIcon: <IconAlertCircle size={25} />
	},
	{
		text: (
			<div>
				Constructive criticism is encouraged.{" "}
				<span className="underline">
					<Link href="/guidelines" target="_blank">
						Click here to learn more
					</Link>
				</span>
			</div>
		),
		color: "yellow",
		displayIcon: <IconAlertTriangle size={25} />
	}
];

// Keys for local storage
const reviewFormKeys = (courseCode: string) => ({
	sectionKey: `reviewFormSection_${courseCode}`,
	termKey: `reviewFormTerm_${courseCode}`,
	academicYearKey: `reviewFormAcademicYear_${courseCode}`,
	ratingKey: `reviewFormRating_${courseCode}`,
	descriptionKey: `reviewFormDescription_${courseCode}`
});

export default function WriteReviewForm({ courseCode, onSubmit, previousReview }: WriteReviewFormProps) {
	const reviewKeys = useMemo(() => reviewFormKeys(courseCode || ""), [courseCode]);
	const [academicYear, setAcademicYear] = useState<string | null>(previousReview?.academicYear || null);
	const [rating, setRating] = useState(previousReview?.rating || 0);
	const [term, setTerm] = useState<string | null>(null);
	const [section, setSection] = useState<string | null>(null);

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
			const savedSection = localStorage.getItem(reviewKeys.sectionKey);
			const savedTerm = localStorage.getItem(reviewKeys.termKey);
			const savedAcademicYear = localStorage.getItem(reviewKeys.academicYearKey);
			const savedRating = localStorage.getItem(reviewKeys.ratingKey);
			const savedDescription = localStorage.getItem(reviewKeys.descriptionKey);

			if (savedSection) setSection(savedSection);
			if (savedTerm) setTerm(savedTerm);
			if (savedAcademicYear) setAcademicYear(savedAcademicYear);
			if (savedRating) setRating(parseFloat(savedRating));
			if (savedDescription && markdownEditor) markdownEditor.commands.setContent(savedDescription);
		}
	}, [previousReview, markdownEditor, reviewKeys]);

	useEffect(() => {
		if (rating) localStorage.setItem(reviewKeys.ratingKey, rating.toString());
		if (academicYear) localStorage.setItem(reviewKeys.academicYearKey, academicYear);
		if (section) localStorage.setItem(reviewKeys.sectionKey, section);
		if (term) localStorage.setItem(reviewKeys.termKey, term);
		if (markdownEditor) {
			const saveMarkdown = () => {
				localStorage.setItem(reviewKeys.descriptionKey, markdownEditor.storage.markdown.getMarkdown());
			};
			markdownEditor.on("update", saveMarkdown);
			return () => {
				markdownEditor.off("update", saveMarkdown);
			};
		}
	}, [markdownEditor, academicYear, reviewKeys, rating, section, term]);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
		e.preventDefault();
		const currentDescription = markdownEditor?.storage.markdown.getMarkdown() || "";

		const missingFields: string[] = [];
		const fields = [
			{ name: "academicYear", label: "academic year" },
			{ name: "currentDescription", label: "review descriptions" },
			{ name: "rating", label: "ratings" },
			{ name: "section", label: "section" },
			{ name: "term", label: "term" }
		];

		fields.forEach((field) => {
			if (!eval(field.name)) {
				missingFields.push(field.label);
			}
		});

		if (missingFields.length > 0) {
			notifications.show({
				title: "Hold on! Your review still contains some missing fields",
				color: "red",
				message: `Please fill in the following fields: ${missingFields.join(", ")}`,
				autoClose: 5000
			});
			return;
		}
		onSubmit(academicYear!!, currentDescription, rating).then((success) => {
			if (success) {
				resetForm();
				localStorage.removeItem(reviewKeys.academicYearKey);
				localStorage.removeItem(reviewKeys.ratingKey);
				localStorage.removeItem(reviewKeys.descriptionKey);
				localStorage.removeItem(reviewKeys.termKey);
				localStorage.removeItem(reviewKeys.sectionKey);
			}
		});
	};

	return (
		<Box component="form" onSubmit={handleSubmit}>
			{reviewGuidelines.map((guide) => (
				<Blockquote key={`review_guideline_${guide.text}`} color={guide.color} w="100%" p="sm" mb="xs">
					<Flex justify="flex-start" gap="sm">
						{guide.displayIcon}
						{guide.text}
					</Flex>
				</Blockquote>
			))}

			<Paper w="100%" h="100%">
				<Flex align="end" wrap="wrap" direction="row" gap="xs" my="sm">
					<Select
						className="w-[100px]"
						data={["1", "2", "3", "4", "5"]}
						value={section}
						label="Section"
						onChange={setSection}
						placeholder="Section"
					/>
					<Select
						className="w-[100px]"
						data={["1", "2", "3"]}
						value={term}
						label="Term"
						onChange={setTerm}
						placeholder="Term"
					/>
					<Select
						className="w-[100px]"
						data={academicYearOptions}
						value={academicYear}
						label="Year"
						onChange={setAcademicYear}
						placeholder="year"
					/>
					<Rating size="lg" defaultValue={0} fractions={2} value={rating} onChange={setRating} />
				</Flex>

				<MarkdownEditor editor={markdownEditor} />

				<Flex gap="sm" justify="end" align="center">
					<Button type="submit" my="sm" className="min-w-36">
						Submit Review
					</Button>
				</Flex>
			</Paper>
		</Box>
	);
}
