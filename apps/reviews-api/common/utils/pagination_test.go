package utils

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestPagination(t *testing.T) {
	t.Run("display totalPages as 3 if we're showing 2 items on each page, for a total of 5 items", func(t *testing.T) {
		totalItems := 5
		pageInformation := &PageInformation{
			Size:   2,
			Number: 1,
		}

		pg := NewPagination([]any{}, totalItems, pageInformation)
		assert.Equal(t, 3, pg.TotalPages)
	})

	t.Run("display totalPages as 2 if we're showing 3 items on each page, for a total of 5 items", func(t *testing.T) {
		totalItems := 5
		pageInformation := &PageInformation{
			Size:   3,
			Number: 1,
		}

		pg := NewPagination([]any{}, totalItems, pageInformation)
		assert.Equal(t, 2, pg.TotalPages)
	})
}
