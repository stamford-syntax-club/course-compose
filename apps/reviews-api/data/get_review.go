package data

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/stamford-syntax-club/course-compose/prisma/db"
)

func GetAllReviews(ctx context.Context, client *db.PrismaClient, courseCode string) ([]ReviewJSONResponse, error) {
	course, err := client.Course.FindFirst(
		db.Course.Code.Equals(courseCode),
	).Exec(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return []ReviewJSONResponse{}, nil
		}

		return nil, errors.New(fmt.Sprintf("GetAllReviews: find course: %v", err))
	}

	reviews, err := client.Review.FindMany(
		db.Review.CourseID.Equals(course.ID),
	).With(
		db.Review.Course.Fetch(),
        db.Review.Profile.Fetch(),
	).Exec(ctx)
	if err != nil {
		return nil, errors.New(fmt.Sprintf("GetAllReviews: find reviews: %v", err))
	}

	var reviewJSONResponses []ReviewJSONResponse
	for _, review := range reviews {
		reviewJSONResponses = append(reviewJSONResponses, ReviewJSONResponse{
			ID:           review.ID,
			AcademicYear: review.AcademicYear,
			Description:  review.Description,
			Rating:       review.Rating,
			Votes:        review.Votes,
			Course: CourseJSONResponse{
				ID:   review.Course().ID,
				Code: review.Course().Code,
			},
		})
	}
	return reviewJSONResponses, nil
}
