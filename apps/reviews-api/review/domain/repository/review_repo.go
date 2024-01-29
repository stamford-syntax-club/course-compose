package review_repo

import (
	"context"

	"github.com/stamford-syntax-club/course-compose/reviews/common/utils"
	"github.com/stamford-syntax-club/course-compose/reviews/review/data/datasource/db"
)

type ReviewRepository interface {
	GetCourseReviews(context.Context, string, string, *utils.PageInformation) ([]db.ReviewModel, int, error)
	SubmitReview(context.Context, *db.ReviewModel, string, string) (*db.ReviewModel, error)
}
