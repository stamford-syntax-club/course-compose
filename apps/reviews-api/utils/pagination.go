package utils

type PageInformation struct {
	Number int `json:"number"`
	Size   int `json:"size"`
}

type Pagination struct {
	*PageInformation   `json:"pageInformation"`
	TotalNumberOfItems int         `json:"totalNumberOfItems"`
	TotalPages         int         `json:"totalPages"`
	Data               interface{} `json:"data"`
}

// TODO: test this!
func NewPagination[T any](displayData []T, pageSize, pageNumber, totalNumberOfItems int) *Pagination {
	totalPages := (totalNumberOfItems + pageSize - 1) / pageSize
	return &Pagination{
		PageInformation: &PageInformation{
			Number: pageNumber,
			Size:   pageSize,
		},
		TotalNumberOfItems: totalNumberOfItems,
		TotalPages:         totalPages,
		Data:               displayData,
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
