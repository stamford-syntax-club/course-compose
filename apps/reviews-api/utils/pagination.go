package utils

type PageInformation struct {
	Number int `json:"number"`
	Size   int `json:"size"`
}

type PageOpts struct {
}

type Pagination struct {
	*PageInformation `json:"pageInformation"`
	First            int         `json:"first"`
	Last             int         `json:"last"`
	Data             interface{} `json:"data"`
}

func NewPagination[T any](pageSize, pageNumber int, data []T) *Pagination {
	firstItem := (pageNumber-1)*pageSize + 1
	if firstItem > len(data) {
		firstItem = len(data)
	}

	lastItem := pageNumber * pageSize
	if lastItem > len(data) {
		lastItem = len(data)
	}

	return &Pagination{
		PageInformation: &PageInformation{
			Number: pageNumber,
			Size:   pageSize,
		},
		First: firstItem,
		Last:  lastItem,
		Data:  data,
	}
}
