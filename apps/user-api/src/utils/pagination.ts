import { Pagination } from "@models/pagination.model";

export function paginate(data: any[], pageSize: number, pageNumber: number, totalNumberOfItems: number): Pagination {
	const totalPages = Math.floor((totalNumberOfItems + pageSize - 1) / pageSize);
	return {
		pageInformation: {
			size: pageSize,
			number: pageNumber
		},
		totalNumberOfItems: totalNumberOfItems,
		totalPages: totalPages,
		data: data
	};
}
