package data

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"

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

func getReviewsCount(ctx context.Context, client *db.PrismaClient, status string, courseID int, courseCountChan chan<- int) {
	var result []map[string]string
	query := fmt.Sprintf(`SELECT COUNT(*) FROM public."Review" WHERE status = '%s' AND course_id = %d`, status, courseID)

	if err := client.Prisma.QueryRaw(query).Exec(ctx, &result); err != nil {
		log.Println("exec get approved reviews count query: ", err)
		courseCountChan <- 0
	}

	count, err := strconv.Atoi(result[0]["count"])
	if err != nil {
		log.Println("parse approved reviews count: ", err)
		courseCountChan <- 0
	}

	courseCountChan <- count
}

func getReviews(ctx context.Context, client *db.PrismaClient, userID string, courseID, pageSize, pageNumber int) ([]db.ReviewModel, error) {
	reviewsQuery := client.Review.FindMany(
		db.Review.CourseID.Equals(courseID),
		db.Review.UserID.Not(userID), // get others' reviews only - find user's review separately
		db.Review.Status.Equals("APPROVED"),
	).With(
		db.Review.Course.Fetch(),
		db.Review.Profile.Fetch(),
	).Take(pageSize).OrderBy(db.Review.CreatedAt.Order(db.SortOrderDesc))

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

func getMyReview(ctx context.Context, client *db.PrismaClient, userID string, courseID, pageNumber int, myReviewIDChan chan<- *db.ReviewModel) {
	// only retrieve on the first page
	if pageNumber > 1 {
		myReviewIDChan <- nil
		return
	}

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
	courseID, err := getCourseID(ctx, client, courseCode)
	if err != nil {
		return nil, err
	}

	// force only 2 reviews to be retrived for non-active users
	if !isActiveUser(ctx, client, userID) {
		pageSize = 2
		pageNumber = 1
	}

	// run getMyReview concurrently with getReviews
	myReviewChan := make(chan *db.ReviewModel)
	defer close(myReviewChan)
	go getMyReview(ctx, client, userID, courseID, pageNumber, myReviewChan)

	// get total number of reviews concurrently
	courseCountChan := make(chan int)
	defer close(courseCountChan)
	go getReviewsCount(ctx, client, "APPROVED", courseID, courseCountChan)

	rawReviews, err := getReviews(ctx, client, userID, courseID, pageSize, pageNumber)
	if err != nil {
		return nil, err
	}

	myReview := <-myReviewChan
	totalNumberOfItems := <-courseCountChan

	data := parseReviewJSONResponse(rawReviews, myReview)

	return utils.NewPagination(data, pageSize, pageNumber, totalNumberOfItems), nil
}
