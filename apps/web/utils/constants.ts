export const ERR_MISSING_TOKEN = "missing or malformed JWT";
export const ERR_EXPIRED_TOKEN = "token has invalid claims: token is expired";
export const ERR_REVIEW_EXIST = "You have already written a review for this course";
export const ERR_USER_NOT_EXIST = "User does not exist";
export const ERR_USER_NOT_OWNER = "User is not the owner of this review";
export const ERR_INTERNAL_SERVER = "Internal Server Error";

const HOST_NAME: string = (() => {
	switch (process.env.APP_ENV) {
		case "production" || "beta":
			return "api-gateway"; // this is resolvable within docker bridge network
		default:
			console.warn(`Unexpected APP_ENV value: ${process.env.APP_ENV}. Falling back to localhost.`);
			return "localhost"; // otherwise we send traffic to local api gateway
	}
})();

export const BASE_API_ENDPOINT = `http://${HOST_NAME}:8000/api`;
