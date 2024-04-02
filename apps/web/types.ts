export interface CourseCardProps {
	courseName: string;
	courseCode: string;
	coursePrerequisites?: string[];
	courseRating: number;
	courseReviewCount: number;
	description: string;
}

export interface MyReviewsData {
	academicYear: number;
	course: {
		code: string;
		id: number;
	};
	created_at: string;
	description: string;
	id: number;
	isOwner: boolean;
	profile: {
		id: string;
	};
	rating: number;
	status: string;
	votes: number;
}

export interface AccordionItems {
	value: string;
	posts: MyReviewsData[];
	severity: string;
}
