package repository_impl

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/stamford-syntax-club/course-compose/reviews/review/data/datasource/db"
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
		log.Println("Skipping, it's greater than 1")
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

// check if user has already written a review for this course
// returns nil if user has not written a review for this course
// returns error if user has written a review for this course OR there is some problem with the database
func hasExistingReview(ctx context.Context, prisma *db.PrismaClient, courseID int, userID string) error {
	review, err := prisma.Review.FindFirst(
		db.Review.CourseID.Equals(courseID),
		db.Review.UserID.Equals(userID),
	).Exec(ctx)
	if err != nil {
		if errors.Is(err, db.ErrNotFound) { // user has not written a review for this course
			return nil
		}
		log.Println("exec find existing review query: ", err)
		return fiber.ErrInternalServerError
	}

	if review != nil {
		return fiber.NewError(http.StatusBadRequest, "You have already written a review for this course")
	}

	return nil
}

func isReviewOwner(ctx context.Context, prisma *db.PrismaClient, submittedID, courseID int, userID string) error {
	myReviewCh := make(chan *db.ReviewModel)
	go getMyReview(ctx, prisma, userID, courseID, 1, myReviewCh)

	result := <-myReviewCh
	if result == nil || result.ID != submittedID {
		return fiber.NewError(http.StatusBadRequest, "user is not the owner of this review")
	}

	return nil
}

func getUser(ctx context.Context, client *db.PrismaClient, userID string) (*db.ProfileModel, error) {
	user, err := client.Profile.FindFirst(
		db.Profile.ID.Equals(userID),
	).Exec(ctx)
	if err != nil {
		if errors.Is(err, db.ErrNotFound) {
			return nil, fiber.NewError(http.StatusBadRequest, "User does not exist")
		}
		log.Println("exec find user: ", err)
		return nil, fiber.ErrInternalServerError
	}

	return user, nil
}

func isActiveUser(ctx context.Context, client *db.PrismaClient, userID string) bool {
	if userID == "" {
		return false
	}

	user, err := client.Profile.FindFirst(
		db.Profile.ID.Equals(userID),
	).Exec(ctx)
	if err != nil {
		if !errors.Is(err, db.ErrNotFound) {
			log.Println("exec find active user query: ", err)
		}
		return false
	}

	return user.IsActive
}
