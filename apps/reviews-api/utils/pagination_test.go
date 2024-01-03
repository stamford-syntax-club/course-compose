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
