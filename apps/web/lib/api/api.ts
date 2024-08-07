import type { Course } from "types/course";
import type { Review } from "types/reviews";
import type { ErrorResponse } from "types/errors";
import type { PaginatedResponse } from "types/pagination";
import {
	ERR_EXPIRED_TOKEN,
	ERR_REVIEW_EXIST,
	ERR_USER_NOT_EXIST,
	ERR_MISSING_TOKEN,
	ERR_USER_NOT_OWNER,
	COURSE_API_ENDPOINT,
	ERR_USER_NOT_STUDENT
} from "@utils/constants";
import { notifications, type NotificationData } from "@mantine/notifications";

export default class CourseComposeAPIClient {
	private courseEndpoint: string;
	private reviewEndpoint: string;

	constructor(courseCode: string) {
		this.courseEndpoint = `${COURSE_API_ENDPOINT}/${courseCode}`;
		this.reviewEndpoint = `${this.courseEndpoint}/reviews`;
	}

	async fetchCourse(
		sortBy: string,
		sortOrder: string,
		searchValue: string,
		pageNumber: number
	): Promise<PaginatedResponse<Course>> {
		const data = await fetch(
			`${COURSE_API_ENDPOINT}?pageNumber=${pageNumber}&pageSize=9&search=${searchValue}&sortBy=${sortBy}&order=${sortOrder}`
		);

		if (!data.ok) {
			const err = (await data.json()) as ErrorResponse;
			throw new Error(err.message);
		}

		return data.json() as Promise<PaginatedResponse<Course>>;
	}

	async fetchCourseDetails(): Promise<Course> {
		const data = await fetch(this.courseEndpoint);

		if (!data.ok) {
			const err = (await data.json()) as ErrorResponse;
			throw new Error(err.message);
		}

		return data.json() as Promise<Course>;
	}

	async fetchCourseReviews(pageNumber: number, accessToken: string): Promise<PaginatedResponse<Review>> {
		const data = await fetch(`${this.reviewEndpoint}?pageNumber=${pageNumber}&pageSize=10`, {
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		});

		if (!data.ok) {
			const err = (await data.json()) as ErrorResponse;
			if (err.message === ERR_USER_NOT_STUDENT) {
				notifications.show({
					title: err.message,
					message: "Please sign out as guests to continue using the site",
					color: "red",
					autoClose: 5000
				});
			} else {
				notifications.show({
					title: "Something is wrong on our end",
					message: "We could not retrieve reviews for this course at the moment, please try again later",
					color: "red",
					autoClose: 5000
				});
			}
			throw new Error(err.message);
		}

		return data.json() as Promise<PaginatedResponse<Review>>;
	}

	async submitNewReview(
		section: string,
		term: string,
		academicYear: string,
		description: string,
		rating: number,
		accessToken: string
	): Promise<NotificationData> {
		const data = await fetch(this.reviewEndpoint, {
			method: "POST",
			body: JSON.stringify({
				section: parseInt(section),
				term: parseInt(term),
				academic_year: parseInt(academicYear),
				description,
				rating
			}),
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${accessToken}`
			}
		});

		if (data.ok) {
			return {
				title: "Submit review successfully",
				message: "Your review has been submitted. Thank you so much for making Stamford a better place!",
				color: "green"
			};
		}

		const errMsg = ((await data.json()) as ErrorResponse).message;
		switch (errMsg) {
			case ERR_MISSING_TOKEN:
			case ERR_EXPIRED_TOKEN:
			case ERR_USER_NOT_EXIST:
				return {
					title: "",
					message: ""
				};
			case ERR_REVIEW_EXIST:
				return {
					title: errMsg,
					message: "You can either edit or delete your existing review",
					color: "red",
					autoClose: 5000
				};
			case ERR_USER_NOT_STUDENT:
				return {
					title: errMsg,
					message: "Please sign out as guests to continue using the site",
					color: "red",
					autoClose: 5000
				};
			default:
				return {
					title: "Something is wrong on our end",
					message: "Your review cannot be submitted yet, please try again later",
					color: "red",
					autoClose: 5000
				};
		}
	}

	async submitEditedReview(
		id: number,
		section: string,
		term: string,
		academicYear: string,
		description: string,
		rating: number,
		accessToken: string
	): Promise<NotificationData> {
		const data = await fetch(`${this.reviewEndpoint}/edit`, {
			method: "PUT",
			body: JSON.stringify({
				id,
				section: parseInt(section),
				term: parseInt(term),
				academic_year: parseInt(academicYear),
				description,
				rating
			}),
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${accessToken}`
			}
		});

		if (data.ok) {
			return {
				title: "Submitted your edited review successfully",
				message: "Your changes are being reviewed by our admin and will go live when it is approved",
				color: "green"
			};
		}

		const errMsg = ((await data.json()) as ErrorResponse).message;
		switch (errMsg) {
			case ERR_MISSING_TOKEN:
			case ERR_EXPIRED_TOKEN:
			case ERR_USER_NOT_EXIST:
				return {
					title: "",
					message: ""
				};
			case ERR_USER_NOT_OWNER:
				return {
					title: "The review cannot be edited",
					message: "You can only edit your own review",
					color: "red",
					autoClose: 5000
				};
			default:
				return {
					title: "Something is wrong on our end",
					message: "Your review cannot be submitted yet, please try again later",
					color: "red",
					autoClose: 5000
				};
		}
	}

	async submitDeleteReview(reviewId: number, accessToken: string): Promise<NotificationData> {
		const data = await fetch(`${this.reviewEndpoint}/${reviewId}`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${accessToken}`
			}
		});
		if (data.ok) {
			return {
				title: "The review deleted",
				message: "Your review has been deleted successfully",
				color: "green"
			};
		}

		return {
			title: "Something is wrong on our end",
			message: "Your review cannot be deleted yet, please try again later",
			color: "red",
			autoClose: 5000
		};
	}
}
