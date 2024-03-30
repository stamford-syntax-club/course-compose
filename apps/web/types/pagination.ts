export interface PaginatedResponse<T> {
	pageInformation: { number: number; size: number };
	totalNumberOfItems: number;
	totalPages: number;
	data: T[];
}
