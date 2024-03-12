package dto

import (
	"log"

	"github.com/stamford-syntax-club/course-compose/reviews/review/data/datasource/db"
)

func MapReviewToReviewDTO(reviews []db.ReviewModel, userID string) []ReviewDTO {
	reviewJSONResponses := []ReviewDTO{}
	for _, review := range reviews {
		profile, ok := review.Profile()
		if !ok {
			log.Printf("failed to get profile for review id %d", review.ID)
			continue
		}

		reviewJSONResponses = append(reviewJSONResponses, ReviewDTO{
			ID:             review.ID,
			AcademicYear:   review.AcademicYear,
			Description:    review.Description,
			IsOwner:        review.UserID == userID,
			Rating:         review.Rating,
			Status:         review.Status,
			RejectedReason: review.RejectedReason,
			Votes:          review.Votes,
			Course: CourseDTO{
				ID:   review.Course().ID,
				Code: review.Course().Code,
			},
			Profile: UserDTO{
				ID: profile.ID,
			},
			CreatedAt: review.CreatedAt,
		})
	}

	return reviewJSONResponses
}
