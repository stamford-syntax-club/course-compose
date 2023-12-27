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

func getReviews(ctx context.Context, client *db.PrismaClient, userID string, courseID int) ([]db.ReviewModel, error) {
	reviewsQuery := client.Review.FindMany(
		db.Review.CourseID.Equals(courseID),
		db.Review.UserID.Not(userID), // get others' reviews only - find user's review separately
		db.Review.Status.Equals("APPROVED"),
	).With(
		db.Review.Course.Fetch(),
		db.Review.Profile.Fetch(),
	).OrderBy(
		db.Review.CreatedAt.Order(db.SortOrderDesc), // latest reviews first
	)
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

func getMyReview(ctx context.Context, client *db.PrismaClient, courseID int, userID string, myReviewIDChan chan<- *db.ReviewModel) {
	myReview, err := client.Review.FindFirst(
		db.Review.CourseID.Equals(courseID),
		db.Review.UserID.Equals(userID),
	).With(
		db.Review.Course.Fetch(),
		db.Review.Profile.Fetch(),
	).Exec(ctx)
	if err != nil {
		if !errors.Is(err, db.ErrNotFound) {
			log.Println("exec find my reviews query: ", err)
		}
		myReviewIDChan <- nil
		return
	}

	myReviewIDChan <- myReview
}

func parseReviewJSONResponse(reviews []db.ReviewModel, myReview *db.ReviewModel) []ReviewJSONResponse {
	myReviewID := 0 // prevent nil pointer dereference in case myReview does not exist
	if myReview != nil {
		reviews = append([]db.ReviewModel{*myReview}, reviews...) // add myReview to the beginning of reviews
		myReviewID = myReview.ID
	}

	reviewJSONResponses := []ReviewJSONResponse{}
	for _, review := range reviews {
		profile, ok := review.Profile()
		if !ok {
			log.Printf("failed to get profile for review id %d", review.ID)
			continue
		}

		reviewJSONResponses = append(reviewJSONResponses, ReviewJSONResponse{
			ID:           review.ID,
			AcademicYear: review.AcademicYear,
			Description:  review.Description,
			IsOwner:      review.ID == myReviewID,
			Rating:       review.Rating,
			Status:       review.Status,
			Votes:        review.Votes,
			Course: CourseJSONResponse{
				ID:   review.Course().ID,
				Code: review.Course().Code,
			},
			Profile: UserJSONResponse{
				ID: profile.ID,
			},
		})
	}

	return reviewJSONResponses
}

func GetCourseReviews(ctx context.Context, client *db.PrismaClient, courseCode, userID string, pageSize, pageNumber int) (*utils.Pagination, error) {
	myReviewChan := make(chan *db.ReviewModel)
	defer close(myReviewChan)

	courseID, err := getCourseID(ctx, client, courseCode)
	if err != nil {
		return nil, err
	}

	// run getMyReview concurrently with getReviews
	go getMyReview(ctx, client, courseID, userID, myReviewChan)
	rawReviews, err := getReviews(ctx, client, userID, courseID)
	if err != nil {
		return nil, err
	}

	totalNumberOfItems := len(rawReviews)

	// force only 2 reviews to be retrived for non-active users
	if !isActiveUser(ctx, client, userID) {
		pageSize = 2
		pageNumber = 1
		totalNumberOfItems = maxReviewsForNonActiveUsers
	}

	myReview := <-myReviewChan
	if myReview != nil {
		totalNumberOfItems++
	}

	start, end := utils.CalculateStartEnd(rawReviews, pageSize, pageNumber)
	if start > len(rawReviews) {
		return utils.NewPagination([]ReviewJSONResponse{}, pageSize, pageNumber, totalNumberOfItems), nil
	}

	data := parseReviewJSONResponse(rawReviews[start:end], myReview)

	return utils.NewPagination(data, pageSize, pageNumber, totalNumberOfItems), nil
}
