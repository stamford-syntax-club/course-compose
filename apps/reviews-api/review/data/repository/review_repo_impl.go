package repository_impl

import (
	"context"
	"errors"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/stamford-syntax-club/course-compose/reviews/common/utils"
	"github.com/stamford-syntax-club/course-compose/reviews/review/data/datasource/db"
	"github.com/stamford-syntax-club/course-compose/reviews/review/data/datasource/kafka"
	"github.com/stamford-syntax-club/course-compose/reviews/review/domain/dto"
)

type reviewRepositoryImpl struct {
	reviewDB    *db.PrismaClient
	reviewKafka *kafka.ReviewKafka
}

func NewReviewRepositoryImpl(db *db.PrismaClient, reviewProducer *kafka.ReviewKafka) *reviewRepositoryImpl {
	return &reviewRepositoryImpl{
		reviewDB:    db,
		reviewKafka: reviewProducer,
	}
}

func (rr *reviewRepositoryImpl) GetCourseReviews(ctx context.Context, courseCode string, userID string, pageInformation *utils.PageInformation) ([]db.ReviewModel, int, error) {
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
	myReviewChan := make(chan *db.ReviewModel)
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
		rawReviews = append([]db.ReviewModel{*myReview}, rawReviews...)
	}

	return rawReviews, <-reviewsCountCh, nil
}

func (r *reviewRepositoryImpl) SubmitReview(ctx context.Context, review *db.ReviewModel, courseCode, userID string) (*db.ReviewModel, error) {
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
		db.Review.AcademicYear.Set(review.AcademicYear),
		db.Review.Description.Set(review.Description),
		db.Review.Rating.Set(review.Rating),
		db.Review.Votes.Set(0),
		db.Review.Status.Set("PENDING"),
		db.Review.Course.Link(db.Course.ID.Equals(courseID)),
		db.Review.Profile.Link(db.Profile.ID.Equals(userID)),
	).Exec(ctx)
	if err != nil {
		log.Println("exec create pending review: ", err)
		return nil, fiber.ErrInternalServerError
	}

	msg := dto.ReviewDTO{
		ID:           result.ID,
		Rating:       result.Rating,
		AcademicYear: result.AcademicYear,
		Description:  result.Description,
		Course: dto.CourseDTO{
			Code: courseCode,
		},
		Action: "submit",
	}
	if err := r.reviewKafka.Produce(msg); err != nil {
		return nil, err
	}

	return result, nil
}

func (r *reviewRepositoryImpl) EditReview(ctx context.Context, review *db.ReviewModel, courseCode, userID string) (*db.ReviewModel, error) {
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

	result, err := r.reviewDB.Review.FindUnique(
		db.Review.ID.Equals(review.ID),
	).Update(
		db.Review.AcademicYear.SetIfPresent(&review.AcademicYear),
		db.Review.Description.SetIfPresent(&review.Description),
		db.Review.Rating.SetIfPresent(&review.Rating),
		db.Review.Status.Set("PENDING"), // edited review must be evaluated again
	).Exec(ctx)
	if err != nil {
		log.Println("exec updating review: ", err)
		return nil, fiber.ErrInternalServerError
	}

	msg := dto.ReviewDTO{
		ID:           result.ID,
		Rating:       result.Rating,
		AcademicYear: result.AcademicYear,
		Description:  result.Description,
		Course: dto.CourseDTO{
			Code: courseCode,
		},
		Action: "edit",
	}
	if err := r.reviewKafka.Produce(msg); err != nil {
		return nil, err
	}

	return result, nil
}

func (r *reviewRepositoryImpl) DeleteReview(ctx context.Context, reviewId int, courseCode, userId string) error {
	courseId, err := getCourseID(ctx, r.reviewDB, courseCode)
	if err != nil {
		return err
	}

	if err := isReviewOwner(ctx, r.reviewDB, reviewId, courseId, userId); err != nil {
		return err
	}

	deletedReview, err := r.reviewDB.Review.FindUnique(
		db.Review.ID.Equals(reviewId),
	).Delete().Exec(ctx)
	if err != nil {
		log.Println("exec delete review: ", err)
		return fiber.ErrInternalServerError
	}

	msg := dto.ReviewDTO{
		ID: reviewId,
		Course: dto.CourseDTO{
			Code: courseCode,
		},
		Action: "delete",
	}
	if err := r.reviewKafka.Produce(msg); err != nil {
		return err
	}

	log.Printf("Deleted review %+v\n", deletedReview)
	return nil
}

func (r *reviewRepositoryImpl) UpdateReviewStatus(ctx context.Context, reviewDecision *dto.ReviewDecisionDTO) (*db.ReviewModel, error) {
	updatedReview, err := r.reviewDB.Review.FindUnique(
		db.Review.ID.Equals(reviewDecision.ID),
	).Update(
		db.Review.Status.Set(reviewDecision.Status),
		db.Review.RejectedReason.Set(reviewDecision.RejectedReason),
	).Exec(ctx)

	if err != nil {
		if errors.Is(err, db.ErrNotFound) {
			return nil, fiber.ErrNotFound
		}
		log.Println("exec update review status:", err)
		return nil, fiber.ErrInternalServerError
	}

	if updatedReview.Status == "APPROVED" {
		_, err := r.reviewDB.Profile.FindUnique(
			db.Profile.ID.Equals(updatedReview.UserID),
		).Update(db.Profile.IsActive.Set(true)).Exec(ctx)
		if err != nil {
			log.Printf("exec update profile active status for review id %d: %v", updatedReview.ID, err)
			return nil, fiber.ErrInternalServerError
		}
	}

	return updatedReview, nil
}

func (r *reviewRepositoryImpl) GetAllMyReviews(ctx context.Context, userID string) ([]db.ReviewModel, error) {
	myReviews, err := r.reviewDB.Review.FindMany(
		db.Review.UserID.Equals(userID),
	).With(
		db.Review.Course.Fetch(),
		db.Review.Profile.Fetch(),
	).OrderBy(db.Review.Status.Order(db.SortOrderAsc)).Exec(ctx)
	if err != nil {
		if !errors.Is(err, db.ErrNotFound) {
			log.Println("exec find my reviews query: ", err)
		}

		return nil, fiber.ErrInternalServerError
	}

	return myReviews, nil
}
