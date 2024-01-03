//go:build integration

package data

import (
	"context"
	"log"
	"testing"
	"time"

	"github.com/stamford-syntax-club/course-compose/prisma/db"
	"github.com/stretchr/testify/assert"
)

// refer to packages/prisma/seed.ts for test data
func setupTestDB(t *testing.T) *db.PrismaClient {
	client := db.NewClient()
	if err := client.Prisma.Connect(); err != nil {
		t.Fatalf("Prisma Connect: %v", err)
	}

	log.Println("Connected to test DB")

	return client
}

func TestGetCourseReview(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	client := setupTestDB(t)
	defer func() {
		cancel()
		if err := client.Prisma.Disconnect(); err != nil {
			t.Fatalf("Prisma Disconnect: %v", err)
		}
	}()

	const (
		activeUserID    = "8a7b3c2e-3e5f-4f1a-a8b7-3c2e1a4f5b6d"
		nonActiveUserID = "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d"
	)

	t.Run("Return nil when course does not exist", func(t *testing.T) {
		result, err := GetCourseReviews(ctx, client, "CHINATHAI999", nonActiveUserID, 2, 1)

		assert.Nil(t, result)
		assert.Error(t, err)
	})

	t.Run("Return empty for data array when course exists but no reviews", func(t *testing.T) {
		result, err := GetCourseReviews(ctx, client, "NOREVIEW101", nonActiveUserID, 2, 1)

		assert.NoError(t, err)
		assert.Empty(t, result.Data)
		assert.Equal(t, 0, result.TotalNumberOfItems)
		assert.Equal(t, 0, result.TotalPages)
	})

	t.Run("Return reviews as specified by pageSize and pageNumber", func(t *testing.T) {
		// Context: There are 4 approved reviews for PHYS101
		firstResult, err := GetCourseReviews(ctx, client, "PHYS101", activeUserID, 4, 1)
		assert.NoError(t, err)
		firstReviewData, ok := (firstResult.Data).([]ReviewJSONResponse)
		assert.True(t, ok)

		secondResult, err := GetCourseReviews(ctx, client, "PHYS101", activeUserID, 2, 1)
		assert.NoError(t, err)
		secondReviewData, ok := (secondResult.Data).([]ReviewJSONResponse)
		assert.True(t, ok)

		assert.Equal(t, 4, len(firstReviewData))
		assert.Equal(t, 4, firstResult.TotalNumberOfItems)
		assert.Equal(t, 1, firstResult.TotalPages)

		assert.Equal(t, 2, len(secondReviewData))
		assert.Equal(t, 4, secondResult.TotalNumberOfItems)
		assert.Equal(t, 2, secondResult.TotalPages)
	})

	t.Run("Return reviews as is when pageSize is greater than total number of reviews", func(t *testing.T) {
		// Context: There are 4 approved reviews for PHYS101
		result, err := GetCourseReviews(ctx, client, "PHYS101", activeUserID, 10, 1)
		assert.NoError(t, err)
		reviewData, ok := (result.Data).([]ReviewJSONResponse)
		assert.True(t, ok)

		assert.Equal(t, 4, len(reviewData))
		assert.Equal(t, 4, result.TotalNumberOfItems)
		assert.Equal(t, 1, result.TotalPages)
	})

	t.Run("Limit 2 reviews if user is not in activeUser table", func(t *testing.T) {
		result, err := GetCourseReviews(ctx, client, "PHYS101", nonActiveUserID, 10, 1)
		assert.NoError(t, err)
		reviewData, ok := (result.Data).([]ReviewJSONResponse)
		assert.True(t, ok)

		assert.Equal(t, 2, len(reviewData)) // only give out 2 reviews for non-active user
		assert.Equal(t, 4, result.TotalNumberOfItems)
		assert.Equal(t, 2, result.TotalPages)
	})
}
