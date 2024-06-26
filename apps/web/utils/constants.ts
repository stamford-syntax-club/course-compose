export const ERR_MISSING_TOKEN = "missing or malformed JWT";
export const ERR_EXPIRED_TOKEN = "token has invalid claims: token is expired";
export const ERR_REVIEW_EXIST = "You have already written a review for this course";
export const ERR_USER_NOT_EXIST = "User does not exist";
export const ERR_USER_NOT_OWNER = "User is not the owner of this review";
export const ERR_USER_NOT_STUDENT = "Only Stamford students can access this service";
export const ERR_INTERNAL_SERVER = "Internal Server Error";

if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
	throw new Error("BACKEND URL is missing");
}

export const BASE_API_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_URL;
export const COURSE_API_ENDPOINT = `${BASE_API_ENDPOINT}/courses`;

export const REVIEW_STATUS_APPROVED = "APPROVED";
export const REVIEW_STATUS_REJECTED = "REJECTED";
export const REVIEW_STATUS_PENDING = "PENDING";
