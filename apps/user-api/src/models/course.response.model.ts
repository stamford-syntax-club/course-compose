interface RawCourse {
	id: number;
	code: string;
	full_name: string;
	prerequisites: string[];
	reviews: { rating: number }[];
}

interface CourseResponse {
	code: string;
	full_name: string;
	prerequisites: string[];
	overall_ratings: number;
	reviews_count: number;
}

export type { CourseResponse, RawCourse };
