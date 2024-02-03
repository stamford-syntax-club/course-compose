package repository_impl

import (
	"context"
	"errors"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/stamford-syntax-club/course-compose/reviews/common/utils"
	review_db "github.com/stamford-syntax-club/course-compose/reviews/review/data/datasource/db"
	"github.com/stamford-syntax-club/course-compose/reviews/review/domain/dto"
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

func (r *reviewRepositoryImpl) SubmitReview(ctx context.Context, review *review_db.ReviewModel, courseCode, userID string) (*review_db.ReviewModel, error) {
	courseID, err := getCourseID(ctx, r.reviewDB, courseCode)
	if err != nil {
		return nil, err
	}

	if _, err := getUser(ctx, r.reviewDB, userID); err != nil {
		return nil, err
	}

	if err := hasExistingReview(ctx, r.reviewDB, courseID, userID); err != nil {
		return nil, err
	}

	result, err := r.reviewDB.Review.CreateOne(
		review_db.Review.AcademicYear.Set(review.AcademicYear),
		review_db.Review.Description.Set(review.Description),
		review_db.Review.Rating.Set(review.Rating),
		review_db.Review.Votes.Set(0),
		review_db.Review.Status.Set("PENDING"),
		review_db.Review.Course.Link(review_db.Course.ID.Equals(courseID)),
		review_db.Review.Profile.Link(review_db.Profile.ID.Equals(userID)),
	).Exec(ctx)
	if err != nil {
		log.Println("exec create pending review: ", err)
		return nil, fiber.ErrInternalServerError
	}

	return result, nil
}

func (r *reviewRepositoryImpl) EditReview(ctx context.Context, review *review_db.ReviewModel, courseCode, userID string) (*review_db.ReviewModel, error) {
	courseID, err := getCourseID(ctx, r.reviewDB, courseCode)
	if err != nil {
		return nil, err
	}

	if _, err := getUser(ctx, r.reviewDB, userID); err != nil {
		return nil, err
	}

	if err := isReviewOwner(ctx, r.reviewDB, review.ID, courseID, userID); err != nil {
		return nil, err
	}

    // TODO: update the review

	return nil, nil
}

func (r *reviewRepositoryImpl) UpdateReviewStatus(ctx context.Context, reviewDecision *dto.ReviewDecisionDTO) (*review_db.ReviewModel, error) {
	updatedReview, err := r.reviewDB.Review.FindUnique(
		review_db.Review.ID.Equals(reviewDecision.ID),
	).Update(
		review_db.Review.Status.Set(reviewDecision.Status),
		review_db.Review.RejectedReason.Set(reviewDecision.RejectedReason),
	).Exec(ctx)

	if err != nil {
		if errors.Is(err, review_db.ErrNotFound) {
			return nil, fiber.ErrNotFound
		}
		log.Println("exec update review status:", err)
		return nil, fiber.ErrInternalServerError
	}

	return updatedReview, nil
}
