export default async function fetcher<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
	const response = await fetch(input, init);

	if (!response.ok) {
		throw new Error(`An error occurred while fetching the data: ${response.statusText}, ${await response.text()}`);
	}

	return response.json() as Promise<T>;
}
