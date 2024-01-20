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

// totalNumberOfItems is needed as it represents the total number of items in the database
// the value of len(displayData) may differ from totalNumberOfItems since it may be filtered out by parseJSONRespone()
func NewPagination[T any](displayData []T, count int, pageInformation *PageInformation) *Pagination {
	totalPages := (count + pageInformation.Size - 1) / pageInformation.Size
	return &Pagination{
		PageInformation:    pageInformation,
		TotalNumberOfItems: count,
		TotalPages:         totalPages,
		Data:               displayData,
	}
}
