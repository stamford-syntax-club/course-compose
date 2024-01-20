//go:build integration

package repository_impl

import (
	"context"
	"log"
	"testing"
	"time"

	"github.com/stamford-syntax-club/course-compose/reviews/common/utils"
	"github.com/stamford-syntax-club/course-compose/reviews/review/data/datasource/db"
	"github.com/stretchr/testify/assert"
)

func setupTestDB(t *testing.T) *db.PrismaClient {
	client := db.NewClient()
	if err := client.Prisma.Connect(); err != nil {
		t.Fatalf("Prisma Connect: %v", err)
	}

	log.Println("Connected to test DB")
	seedReviewData(client)
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

	repo := NewReviewRepositoryImpl(client)

	const (
		activeUserID    = "8a7b3c2e-3e5f-4f1a-a8b7-3c2e1a4f5b6d"
		nonActiveUserID = "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d"
	)

	t.Run("Return nil when course does not exist", func(t *testing.T) {
		pageInformation := &utils.PageInformation{
			Size:   2,
			Number: 1,
		}

		result, count, err := repo.GetCourseReviews(ctx, "CHINATHAI999", nonActiveUserID, pageInformation)
		assert.Nil(t, result)
		assert.Equal(t, 0, count)
		assert.Error(t, err)
	})

	t.Run("Return empty for data array when course exists but no reviews", func(t *testing.T) {
		pageInformation := &utils.PageInformation{
			Size:   2,
			Number: 1,
		}
		result, count, err := repo.GetCourseReviews(ctx, "NOREVIEW101", nonActiveUserID, pageInformation)

		assert.NoError(t, err)
		assert.Empty(t, result)
		assert.Equal(t, 0, count)
	})

	t.Run("Return reviews as specified by pageSize and pageNumber", func(t *testing.T) {
		// Context: There are 4 approved reviews for PHYS101
		firstPageInformation := &utils.PageInformation{
			Size:   4,
			Number: 1,
		}
		firstResult, count, err := repo.GetCourseReviews(ctx, "PHYS101", activeUserID, firstPageInformation)
		assert.NoError(t, err)

		secondPageInformation := &utils.PageInformation{
			Size:   2,
			Number: 1,
		}
		secondResult, count, err := repo.GetCourseReviews(ctx, "PHYS101", activeUserID, secondPageInformation)
		assert.NoError(t, err)

		assert.Equal(t, 4, len(firstResult))
		assert.Equal(t, 4, count)

		assert.Equal(t, 2, len(secondResult))
		assert.Equal(t, 4, count)
	})

	t.Run("Return reviews as is when pageSize is greater than total number of reviews", func(t *testing.T) {
		// Context: There are 4 approved reviews for PHYS101
		pageInformation := &utils.PageInformation{
			Size:   10,
			Number: 1,
		}
		result, count, err := repo.GetCourseReviews(ctx, "PHYS101", activeUserID, pageInformation)

		assert.NoError(t, err)
		assert.Equal(t, 4, len(result))
		assert.Equal(t, 4, count)
	})

	t.Run("Limit 2 reviews if user is not in activeUser table", func(t *testing.T) {
		pageInformation := &utils.PageInformation{
			Size:   10,
			Number: 1,
		}
		result, count, err := repo.GetCourseReviews(ctx, "PHYS101", nonActiveUserID, pageInformation)

		assert.NoError(t, err)
		assert.Equal(t, 2, len(result)) // only give out 2 reviews for non-active user
		assert.Equal(t, 4, count)
	})

	t.Run("put myReview as first item in list if exist", func(t *testing.T) {
		pageInformation := &utils.PageInformation{
			Size:   2,
			Number: 1,
		}
		userID := "3f9e87a9-6d27-4a09-8a0a-20e58d609315" // this user has myReview for PHYS101
		result, count, err := repo.GetCourseReviews(ctx, "PHYS101", userID, pageInformation)

		assert.NoError(t, err)
		assert.Equal(t, 3, len(result)) // myReview is included
		assert.Equal(t, 4, count)
		assert.Equal(t, "Yikes!", result[0].Description)
		assert.Equal(t, float64(2), result[0].Rating)
		assert.Equal(t, 5, result[0].Votes)
	})

	t.Run("do not query for myReview if not first page", func(t *testing.T) {
		pageInformation := &utils.PageInformation{
			Size:   2,
			Number: 2,
		}
		userID := "3f9e87a9-6d27-4a09-8a0a-20e58d609315"
		result, count, err := repo.GetCourseReviews(ctx, "PHYS101", userID, pageInformation)

		assert.NoError(t, err)
		assert.Equal(t, 1, len(result)) // first page already shows 3 (because myReview was there)
		assert.Equal(t, 4, count)
		assert.NotEqual(t, "Yikes!", result[0].Description)
	})
}

func seedReviewData(client *db.PrismaClient) {
	ctx, cancelFunc := context.WithTimeout(context.Background(), time.Second*3)
	defer cancelFunc()
	reviews := []struct {
		academicYear int
		description  string
		rating       float64
		votes        int
		status       string
		courseId     int
		userId       string
	}{
		{
			academicYear: 2022,
			description:  "Great course, highly recommended!",
			rating:       5,
			votes:        10,
			status:       "APPROVED",
			courseId:     1,
			userId:       "8a7b3c2e-3e5f-4f1a-a8b7-3c2e1a4f5b6d",
		},
		{
			academicYear: 2022,
			description:  "The material was challenging but interesting.",
			rating:       4,
			votes:        8,
			status:       "APPROVED",
			courseId:     2,
			userId:       "2d1f3c4e-5a6b-7c8d-9e0f-1a2b3c4d5e6f",
		},
		{
			academicYear: 2022,
			description:  "Not a fan of the teaching style.",
			rating:       2,
			votes:        5,
			status:       "PENDING",
			courseId:     3,
			userId:       "2d1f3c4e-5a6b-7c8d-9e0f-1a2b3c4d5e6f",
		},
		{
			academicYear: 2022,
			description:  "I'm just here to fill up spaces XD",
			rating:       2,
			votes:        5,
			status:       "APPROVED",
			courseId:     3,
			userId:       "8b84c3b5-5b87-4c9b-832d-60d0966d4f7d",
		},
		{
			academicYear: 2022,
			description:  "Me too!",
			rating:       2,
			votes:        5,
			status:       "APPROVED",
			courseId:     3,
			userId:       "d5a59cb2-1f22-4e23-8ef0-7108e54f842b",
		},
		{
			academicYear: 2022,
			description:  "Hello world!",
			rating:       2,
			votes:        5,
			status:       "APPROVED",
			courseId:     3,
			userId:       "6c7b1dd2-aa9d-4f5e-8a98-2c7c2895a95e",
		},
		{
			academicYear: 2022,
			description:  "Yikes!",
			rating:       2,
			votes:        5,
			status:       "APPROVED",
			courseId:     3,
			userId:       "3f9e87a9-6d27-4a09-8a0a-20e58d609315",
		},
	}

	for _, review := range reviews {
		_, err := client.Review.CreateOne(
			db.Review.AcademicYear.Set(review.academicYear),
			db.Review.Description.Set(review.description),
			db.Review.Rating.Set(review.rating),
			db.Review.Votes.Set(review.votes),
			db.Review.Status.Set(review.status),
			db.Review.Course.Link(db.Course.ID.Equals(review.courseId)),
			db.Review.Profile.Link(db.Profile.ID.Equals(review.userId)),
		).Exec(ctx)
		if err != nil {
			log.Fatalln("seeding review: ", err)
		}
	}

	log.Println("seeded data successfully!")
}
