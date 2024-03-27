import type { ReactNode } from "react";

export interface CourseCardProps {
	courseName: string;
	courseCode: string;
	coursePrerequisites?: string[];
	courseRating: number;
	courseReviewCount: number;
}

export interface MyReviewCardProps {
	courseName: string;
	courseCode: string;
	coursePrerequisites?: string[];
	courseRating: number;
	courseReviewCount: number;
	status: string;
}

export interface AccordionItems {
	value: string;
	status: () => ReactNode;
	posts: MyReviewCardProps[];
}
