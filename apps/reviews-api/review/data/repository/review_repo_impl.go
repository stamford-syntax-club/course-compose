package repository_impl

import (
	"context"
	"time"

	"github.com/stamford-syntax-club/course-compose/reviews/common/utils"
	"github.com/stamford-syntax-club/course-compose/reviews/review/data/datasource/db"
)

type reviewRepositoryImpl struct {
	//	review_kafka *reviewKafka.ReviewProducer
	review_DB *db.PrismaClient
}

func NewReviewRepositoryImpl(db *db.PrismaClient) *reviewRepositoryImpl {
	// func NewReviewRepositoryImpl(db *db.PrismaClient, p *kafka.Producer, tp kafka.TopicPartition, deliveryCh chan kafka.Event) *reviewRepositoryImpl {
	return &reviewRepositoryImpl{
		// review_kafka: &reviewKafka.ReviewProducer{
		// 	Producer:       p,
		// 	TopicPartition: tp,
		// 	DeliveryCh:     deliveryCh,
		// },
		review_DB: db,
	}
}

func (rr *reviewRepositoryImpl) GetCourseReviews(ctx context.Context, courseCode string, userID string, pageInformation *utils.PageInformation) ([]db.ReviewModel, int, error) {
	courseID, err := getCourseID(ctx, rr.review_DB, courseCode)
	if err != nil {
		return nil, 0, err
	}

	// force only 2 reviews to be retrived for non-active users
	if !isActiveUser(ctx, rr.review_DB, userID) {
		pageInformation.Size = 2
		pageInformation.Number = 1
	}

	// run getMyReview concurrently with getReviews
	myReviewChan := make(chan *db.ReviewModel)
	defer close(myReviewChan)
	go getMyReview(ctx, rr.review_DB, userID, courseID, pageInformation.Number, myReviewChan)

	// get total number of reviews concurrently
	reviewsCountCh := make(chan int)
	defer close(reviewsCountCh)
	go getReviewsCount(ctx, rr.review_DB, "APPROVED", courseID, reviewsCountCh)

	rawReviews, err := getReviews(ctx, rr.review_DB, userID, courseID, pageInformation.Size, pageInformation.Number)
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

func (r *reviewRepositoryImpl) SubmitReview(ctx context.Context, review *db.ReviewModel, courseCode, userID string) error {
	courseID, err := getCourseID(ctx, r.review_DB, courseCode)
	if err != nil {
		return err
	}

	if _, err := getUser(ctx, r.review_DB, userID); err != nil {
		return err
	}

	if err := hasExistingReview(ctx, r.review_DB, courseID, userID); err != nil {
		return err
	}

	review.Status = "PENDING"
	review.CreatedAt = time.Now()
	review.CourseID = courseID
	review.UserID = userID

	// if err := r.review_kafka.produceToKafka(review); err != nil {
	// 	return err
	// }

	return nil
}
