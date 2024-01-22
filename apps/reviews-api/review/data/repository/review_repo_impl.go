package repository_impl

import (
	"context"
	"time"

	"github.com/stamford-syntax-club/course-compose/reviews/common/utils"
	review_db "github.com/stamford-syntax-club/course-compose/reviews/review/data/datasource/db"
)

type reviewRepositoryImpl struct {
	reviewDB *review_db.PrismaClient
}

func NewReviewRepositoryImpl(db *review_db.PrismaClient) *reviewRepositoryImpl {
	return &reviewRepositoryImpl{
		reviewDB: db,
	}
}

func (rr *reviewRepositoryImpl) GetCourseReviews(ctx context.Context, courseCode string, userID string, pageInformation *utils.PageInformation) ([]review_db.ReviewModel, int, error) {
	courseID, err := getCourseID(ctx, rr.reviewDB, courseCode)
	if err != nil {
		return nil, 0, err
	}

	// force only 2 reviews to be retrived for non-active users
	if !isActiveUser(ctx, rr.reviewDB, userID) {
		pageInformation.Size = 2
		pageInformation.Number = 1
	}

	// run getMyReview concurrently with getReviews
	myReviewChan := make(chan *review_db.ReviewModel)
	defer close(myReviewChan)
	go getMyReview(ctx, rr.reviewDB, userID, courseID, pageInformation.Number, myReviewChan)

	// get total number of reviews concurrently
	reviewsCountCh := make(chan int)
	defer close(reviewsCountCh)
	go getReviewsCount(ctx, rr.reviewDB, "APPROVED", courseID, reviewsCountCh)

	rawReviews, err := getReviews(ctx, rr.reviewDB, userID, courseID, pageInformation.Size, pageInformation.Number)
	if err != nil {
		return nil, 0, err
	}

	myReview := <-myReviewChan
	if myReview != nil {
		// add myReview to the beginning of reviews (performance issue??)
		rawReviews = append([]review_db.ReviewModel{*myReview}, rawReviews...)
	}

	return rawReviews, <-reviewsCountCh, nil
}

func (r *reviewRepositoryImpl) SubmitReview(ctx context.Context, review *review_db.ReviewModel, courseCode, userID string) error {
	courseID, err := getCourseID(ctx, r.reviewDB, courseCode)
	if err != nil {
		return err
	}

	if _, err := getUser(ctx, r.reviewDB, userID); err != nil {
		return err
	}

	if err := hasExistingReview(ctx, r.reviewDB, courseID, userID); err != nil {
		return err
	}

	review.Status = "PENDING"
	review.CreatedAt = time.Now()
	review.CourseID = courseID
	review.UserID = userID

	return nil
}
