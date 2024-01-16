import { CourseResponse, RawCourse } from "@models/course.response.model";

export function calcOverallRating(reviews: { rating: number }[]): number {
	let sum = 0;
	for (let i = 0; i < reviews.length; i++) {
		sum += reviews[i].rating;
	}

	return sum / reviews.length || 0;
}

export function mapCourseToCourseResponse(course: RawCourse): CourseResponse {
	const courseRating = calcOverallRating(course.reviews) || 0;
	return {
		code: course.code,
		full_name: course.full_name,
		prerequisites: course.prerequisites,
		overall_ratings: courseRating,
		reviews_count: course.reviews.length
	};
}
