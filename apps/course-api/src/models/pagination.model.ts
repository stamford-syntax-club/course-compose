interface Pagination {
	pageInformation: PageInformation;
	totalNumberOfItems: number;
	totalPages: number;
	data: any[];
}

interface PageInformation {
	size: number;
	number: number;
}

export type { PageInformation, Pagination };
