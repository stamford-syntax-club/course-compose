package utils

type PageInformation struct {
	Number int `json:"number"`
	Size   int `json:"size"`
}

type Pagination struct {
	*PageInformation   `json:"pageInformation"`
	TotalNumberofItems int         `json:"totalNumberofItems"`
	TotalPages         int         `json:"totalPages"`
	Data               interface{} `json:"data"`
}

// TODO: test this!
func NewPagination[T any](data []T, pageSize, pageNumber, totalNumberOfItems, totalPages int) *Pagination {
	return &Pagination{
		PageInformation: &PageInformation{
			Number: pageNumber,
			Size:   pageSize,
		},
		TotalNumberofItems: totalNumberOfItems,
		TotalPages:         totalPages,
		Data:               data,
	}
}

func CalculateStartEnd[T any](data []T, pageSize, pageNumber int) (start, end int) {
	if pageNumber < 1 {
		pageNumber = 1
	}

	start = (pageNumber - 1) * pageSize
	end = start + pageSize
	if start < 0 {
		start = 0
	}
	if end > len(data) {
		end = len(data)
	}

	return
}
