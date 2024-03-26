import { Course } from "types/course";
import { Review } from "types/reviews";
import { ErrorResponse } from "types/errors";
import { PaginatedResponse } from "types/pagination";
import {
	ERR_EXPIRED_TOKEN,
	ERR_REVIEW_EXIST,
	ERR_USER_NOT_EXIST,
	ERR_MISSING_TOKEN,
	ERR_USER_NOT_OWNER,
	COURSE_API_ENDPOINT
} from "@utils/constants";
import { NotificationData } from "@mantine/notifications";

export default class CourseComposeAPIClient {
	private courseEndpoint: string;
	private reviewEndpoint: string;

	constructor(courseCode: string) {
		this.courseEndpoint = `${COURSE_API_ENDPOINT}/${courseCode}`;
		this.reviewEndpoint = `${this.courseEndpoint}/reviews`;
	}

	async fetchCourseDetails(): Promise<Course> {
		const data = await fetch(this.courseEndpoint);
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
			throw new Error(err.message);
		}

		return data.json() as Promise<PaginatedResponse<Review>>;
	}

	async submitNewReview(
		academicYear: string,
		description: string,
		rating: number,
		accessToken: string
	): Promise<NotificationData> {
		const data = await fetch(this.reviewEndpoint, {
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
		academicYear: string,
		description: string,
		rating: number,
		accessToken: string
	): Promise<NotificationData> {
		const data = await fetch(`${this.reviewEndpoint}/edit`, {
			method: "PUT",
			body: JSON.stringify({
				id: id,
				academic_year: parseInt(academicYear),
				description: description,
				rating: rating
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
		} else {
			return {
				title: "Something is wrong on our end",
				message: "Your review cannot be deleted yet, please try again later",
				color: "red",
				autoClose: 5000
			};
		}
	}
}
