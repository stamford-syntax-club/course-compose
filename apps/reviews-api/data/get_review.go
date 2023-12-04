package data

import (
	"context"
	"errors"
	"log"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/stamford-syntax-club/course-compose/prisma/db"
	"github.com/stamford-syntax-club/course-compose/reviews/utils"
)

const (
	maxReviewsForNonActiveUsers = 2
	maxReviewsForActiveUsers    = 10 // per 1 API call
)

func getCourseID(ctx context.Context, client *db.PrismaClient, courseCode string) (int, error) {
	course, err := client.Course.FindFirst(
		db.Course.Code.Equals(courseCode),
	).Exec(ctx)
	if err != nil {
		if errors.Is(err, db.ErrNotFound) {
			return 0, fiber.NewError(http.StatusBadRequest, "Course does not exist")
		}
		log.Println("exec find course query: ", err)
		return 0, fiber.ErrInternalServerError
	}

	return course.ID, nil
}

func getReviews(ctx context.Context, client *db.PrismaClient, courseID, pageSize, pageNumber int) ([]db.ReviewModel, error) {
	reviewsQuery := client.Review.FindMany(
		db.Review.CourseID.Equals(courseID),
	).With(
		db.Review.Course.Fetch(),
	).Take(pageSize)

	if pageNumber > 1 {
		reviewsQuery = reviewsQuery.Skip((pageNumber - 1) * pageSize)
	}

	reviews, err := reviewsQuery.Exec(ctx)
	if err != nil {
		if errors.Is(err, db.ErrNotFound) {
			return []db.ReviewModel{}, nil
		}
		log.Println("exec find reviews query: ", err)
		return nil, fiber.ErrInternalServerError
	}

	return reviews, nil
}

func getMyReviewID(ctx context.Context, client *db.PrismaClient, courseID int, userID string, myReviewIDChan chan<- int) {
	myReview, err := client.Review.FindFirst(
		db.Review.CourseID.Equals(courseID),
		db.Review.UserID.Equals(userID),
	).With(
		db.Review.Course.Fetch(),
	).Exec(ctx)
	if err != nil {
		if !errors.Is(err, db.ErrNotFound) {
			log.Println("exec find my reviews query: ", err)
		}
		myReviewIDChan <- 0
		return
	}

	myReviewIDChan <- myReview.ID
}

func isActiveUser(ctx context.Context, client *db.PrismaClient, userID string) bool {
	if userID == "" {
		return false
	}

	user, err := client.ActiveUser.FindFirst(
		db.ActiveUser.ID.Equals(userID),
	).Exec(ctx)
	if err != nil {
		if !errors.Is(err, db.ErrNotFound) {
			log.Println("exec find active user query: ", err)
		}
		return false
	}

	return user != nil
}

func parseReviewJSONResponse(reviews []db.ReviewModel, myReviewID int) []ReviewJSONResponse {
	reviewJSONResponses := []ReviewJSONResponse{}
	for _, review := range reviews {

		// if review is pending and not my review, skip
		if review.Status == "PENDING" && review.ID != myReviewID {
			continue
		}

		reviewJSONResponses = append(reviewJSONResponses, ReviewJSONResponse{
			ID:           review.ID,
			AcademicYear: review.AcademicYear,
			Description:  review.Description,
			IsOwner:      review.ID == myReviewID,
			Rating:       review.Rating,
			Votes:        review.Votes,
			Course: CourseJSONResponse{
				ID:   review.Course().ID,
				Code: review.Course().Code,
			},
		})
	}
	return reviewJSONResponses
}

func GetCourseReviews(ctx context.Context, client *db.PrismaClient, courseCode, userID string, pageSize, pageNumber int) (*utils.Pagination, error) {
	myReviewIDChan := make(chan int)
	defer close(myReviewIDChan)

	courseID, err := getCourseID(ctx, client, courseCode)
	if err != nil {
		return nil, err
	}

	// force only 2 reviews to be retrived for non-active users
	if !isActiveUser(ctx, client, userID) {
		pageSize = 2
		pageNumber = 1
	}

	// run getMyReviewID concurrently with getReviews
	go getMyReviewID(ctx, client, courseID, userID, myReviewIDChan)
	rawReviews, err := getReviews(ctx, client, courseID, pageSize, pageNumber)
	if err != nil {
		return nil, err
	}

	myReviewID := <-myReviewIDChan
	reviews := parseReviewJSONResponse(rawReviews, myReviewID)

	return utils.NewPagination(pageSize, pageNumber, reviews), nil
}
