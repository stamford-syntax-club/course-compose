import { Course } from "types/course";
import { Review } from "types/reviews";
import { ErrorResponse } from "types/errors";
import { PaginatedResponse } from "types/pagination";

const HOST_NAME: string = (() => {
	switch (process.env.APP_ENV) {
		case "production" || "beta":
			return "api-gateway"; // this is resolvable within docker bridge network
		default:
			console.warn(`Unexpected APP_ENV value: ${process.env.APP_ENV}. Falling back to localhost.`);
			return "localhost"; // otherwise we send traffic to local api gateway
	}
})();

const BASE_API_ENDPOINT = `http://${HOST_NAME}:8000/api`;
const COURSE_ENDPOINT = `${BASE_API_ENDPOINT}/courses`;

function createReviewEndpoint(courseCode: string): string {
	return `${COURSE_ENDPOINT}/${courseCode}/reviews`;
}

export async function fetchCourseDetails(courseCode: string): Promise<Course> {
	const data = await fetch(`${COURSE_ENDPOINT}/${courseCode}`);
	return data.json() as Promise<Course>;
}

export async function fetchCourseReviews(
	courseCode: string,
	pageNumber: number,
	accessToken: string
): Promise<PaginatedResponse<Review>> {
	const data = await fetch(`${createReviewEndpoint(courseCode)}?pageNumber=${pageNumber}&pageSize=10`, {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});

	if (!data.ok) {
		const err = (await data.json()) as ErrorResponse;
		throw new Error(err.message);
	}

	return data.json() as Promise<PaginatedResponse<Review>>;
}

export async function submitReview(
	courseCode: string,
	academicYear: string,
	description: string,
	rating: number,
	accessToken: string
) {
	const res = await fetch(createReviewEndpoint(courseCode), {
		method: "POST",
		body: JSON.stringify({
			academic_year: parseInt(academicYear),
			description: description,
			rating: rating
		}),
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${accessToken}`
		}
	});
	const data = await res.json();

	switch ((data as ErrorResponse).message) {
		case undefined:
			notifications.show({
				title: "Submit review successfully",
				message: "Your review has been submitted. Thank you so much for making Stamford a better place!",
				color: "green"
			});
			setTimeout(() => {
				window.location.reload();
			}, 5000);
			break;
		case ERR_REVIEW_EXIST:
			notifications.show({
				title: ERR_REVIEW_EXIST,
				message: "You can either edit or delete your existing review",
				color: "red",
				autoClose: 5000
			});
			break;
		case ERR_MISSING_TOKEN || ERR_EXPIRED_TOKEN || ERR_USER_NOT_EXIST:
			open(); // session modal
			break;
		default:
			notifications.show({
				title: "Something is wrong on our end",
				message: "Your review cannot be submitted yet, please try again later",
				color: "red",
				autoClose: 5000
			});
	}
}
