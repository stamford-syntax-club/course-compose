// export default async function fetcher<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
// 	const response = await fetch(input, init);

import type { ErrorResponse } from "types/errors";

// 	if (!response.ok) {
// 		throw new Error(`An error occurred while fetching the data: ${response.statusText}, ${await response.text()}`);
// 	}

// 	return response.json() as Promise<T>;
// }

export interface FetcherResult<T> {
	data?: T | null;
	error?: any; // You can specify a more specific error type if needed
}

export const convertResponse = async (response: Response) => {
	let responseBody;

	const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

	if (contentType.includes("application/json")) {
		responseBody = await response.json();
	} else {
		responseBody = await response.text();
	}

	if (!response.ok) {
		// If the response is not OK, return the error
		// returns response with { data: null, error: {} }
		if (responseBody.data === null && responseBody.error !== null) {
			return responseBody as ErrorResponse;
		}

		// If the response is not OK and the error is not in the expected format, return the response body
		return { data: null, error: responseBody };
	}

	return { data: responseBody, error: null };
};

export default async function fetcher<T>(
	input: RequestInfo,
	accessToken: string,
	init?: RequestInit
): Promise<FetcherResult<T>> {
	const { headers: initHeaders = {}, ...rest } = init || {};

	try {
		const response = await fetch(input, {
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${accessToken}`,
				...initHeaders
			},
			...rest
		});

		return convertResponse(response) as FetcherResult<T>;
	} catch (error) {
		return { data: null, error };
	}
}
