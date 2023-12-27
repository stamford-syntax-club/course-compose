package utils

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestPagination(t *testing.T) {
	t.Run("display totalPages as 3 if we're showing 2 items on each page, for a total of 5 items", func(t *testing.T) {
		totalItems := 5
		pageSize := 2
		pageNumber := 1

		pg := NewPagination([]any{}, pageSize, pageNumber, totalItems)
		assert.Equal(t, 3, pg.TotalPages)
	})

	t.Run("display totalPages as 2 if we're showing 3 items on each page, for a total of 5 items", func(t *testing.T) {
		totalItems := 5
		pageSize := 3
		pageNumber := 1

		pg := NewPagination([]any{}, pageSize, pageNumber, totalItems)
		assert.Equal(t, 2, pg.TotalPages)
	})
}

func TestCalculateStartEnd(t *testing.T) {
	mockData := []any{1, 2, 3, 4, 5}

	tests := []struct {
		name          string
		pageNumber    int
		pageSize      int
		expectedStart int
		expectedEnd   int
	}{
		{
			name:          "Should return start as 0 and end as 2 if pageNumber is 1 and pageSize is 2",
			pageNumber:    1,
			pageSize:      2,
			expectedStart: 0,
			expectedEnd:   2,
		},
		{
			name:          "Should return start as 2 and end as 4 if pageNumber is 2 and pageSize is 2",
			pageNumber:    2,
			pageSize:      2,
			expectedStart: 2,
			expectedEnd:   4,
		},
		{
			name:          "Should return start as 4 and end as 5 if pageNumber is 3 and pageSize is 2",
			pageNumber:    3,
			pageSize:      2,
			expectedStart: 4,
			expectedEnd:   5,
		},
		{
			name:          "set start to 0 if pageNumber is less than 1",
			pageNumber:    -5,
			pageSize:      2,
			expectedStart: 0,
			expectedEnd:   2,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			start, end := CalculateStartEnd(mockData, test.pageSize, test.pageNumber)
			assert.Equal(t, test.expectedStart, start)
			assert.Equal(t, test.expectedEnd, end)
		})
	}
}
