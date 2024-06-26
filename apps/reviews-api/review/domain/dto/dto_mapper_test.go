//go:build unit

package dto

import (
	"testing"

	"github.com/stamford-syntax-club/course-compose/reviews/review/data/datasource/db"
	"github.com/stretchr/testify/assert"
)

func TestMapReviewToReviewDTO(t *testing.T) {
	var (
		courseID   = 333
		courseCode = "ITE343"
		term       = 2
		section    = 1
	)
	reviewsData := []db.ReviewModel{
		{
			InnerReview: db.InnerReview{
				ID:           2,
				AcademicYear: 2023,
				Description:  "This is a review from someone else",
				Term:         &term,
				Section:      &section,
			},
			RelationsReview: db.RelationsReview{
				Course: &db.CourseModel{
					InnerCourse: db.InnerCourse{
						ID:   courseID,
						Code: courseCode,
					},
				},
				Profile: &db.ProfileModel{
					InnerProfile: db.InnerProfile{
						ID: "2",
					},
				},
			},
		},
		{
			InnerReview: db.InnerReview{
				ID:           3,
				AcademicYear: 2023,
				Description:  "This is another review from someone else",
			},
			RelationsReview: db.RelationsReview{
				Course: &db.CourseModel{
					InnerCourse: db.InnerCourse{
						ID:   courseID,
						Code: courseCode,
					},
				},
				Profile: &db.ProfileModel{
					InnerProfile: db.InnerProfile{
						ID: "3",
					},
				},
			},
		},
	}
	t.Run("return empty reviewJSONResponses when empty reviews", func(t *testing.T) {
		reviewsJSONResponses := MapReviewToReviewDTO([]db.ReviewModel{}, "")
		assert.Equal(t, []ReviewDTO{}, reviewsJSONResponses)
	})
	t.Run("return correct reviewJSONResponses when non-empty reviews", func(t *testing.T) {
		reviewsJSONResponses := MapReviewToReviewDTO(reviewsData, "")
		assert.Equal(t, 2, len(reviewsJSONResponses))
		assert.Equal(t, reviewsData[0].ID, reviewsJSONResponses[0].ID)
		assert.Equal(t, reviewsData[0].AcademicYear, reviewsJSONResponses[0].AcademicYear)
		assert.Equal(t, reviewsData[0].Description, reviewsJSONResponses[0].Description)
		assert.Equal(t, term, reviewsJSONResponses[0].Term)
		assert.Equal(t, section, reviewsJSONResponses[0].Section)
		assert.Equal(t, reviewsData[0].RelationsReview.Course.Code, reviewsJSONResponses[0].Course.Code)
		assert.Equal(t, reviewsData[0].RelationsReview.Profile.ID, reviewsJSONResponses[0].Profile.ID)
		assert.Equal(t, reviewsData[1].ID, reviewsJSONResponses[1].ID)
		assert.Equal(t, reviewsData[1].AcademicYear, reviewsJSONResponses[1].AcademicYear)
		assert.Equal(t, reviewsData[1].Description, reviewsJSONResponses[1].Description)
		assert.Equal(t, 0, reviewsJSONResponses[1].Term)    // omitempty
		assert.Equal(t, 0, reviewsJSONResponses[1].Section) // omitempty
		assert.Equal(t, reviewsData[1].RelationsReview.Course.Code, reviewsJSONResponses[1].Course.Code)
		assert.Equal(t, reviewsData[1].RelationsReview.Profile.ID, reviewsJSONResponses[1].Profile.ID)
	})
}
