export interface ErrorResponse {
	message: string;
	status: number;
}

export const ERR_EXPIRED_TOKEN = "token has invalid claims: token is expired";
