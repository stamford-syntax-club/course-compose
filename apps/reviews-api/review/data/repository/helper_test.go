//go:build unit

package repository_impl

import (
	"context"
	"errors"
	"net/http"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stamford-syntax-club/course-compose/reviews/review/data/datasource/db"
	"github.com/stretchr/testify/assert"
)

func TestGetCourseID(t *testing.T) {
	client, mock, ensure := db.NewMock()
	defer ensure(t)

	tests := []struct {
		name             string
		courseCode       string
		expectedCourseID int
		queryError       error // error return from query
		expectedError    error
	}{
		{
			name:             "return course ID when found",
			courseCode:       "ITE343",
			expectedCourseID: 333,
		},
		{
			name:          "return 0 when not found",
			courseCode:    "ITE9999",
			queryError:    db.ErrNotFound,
			expectedError: fiber.NewError(http.StatusBadRequest, "Course does not exist"),
		},
		{
			name:             "return 0 and internal server error when error",
			courseCode:       "ITE1234",
			expectedCourseID: 0,
			queryError:       errors.New("something wrong with db"),
			expectedError:    fiber.ErrInternalServerError,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			expected := db.CourseModel{
				InnerCourse: db.InnerCourse{
					ID:   test.expectedCourseID,
					Code: test.courseCode,
				},
			}
			mockExpect := mock.Course.Expect(
				client.Course.FindFirst(
					db.Course.Code.Equals(test.courseCode),
				),
			)
			if test.expectedCourseID != 0 {
				mockExpect.Returns(expected)
			} else if test.queryError != nil {
				mockExpect.Errors(test.queryError)
			}

			courseID, err := getCourseID(context.Background(), client, test.courseCode)

			assert.Equal(t, test.expectedCourseID, courseID)
			if test.expectedCourseID != 0 {
				assert.NoError(t, err)
			} else if test.expectedError != nil {
				assert.Equal(t, err.Error(), test.expectedError.Error())
			}
		})
	}
}

func TestGetReviews(t *testing.T) {
	client, mock, ensure := db.NewMock()
	defer ensure(t)

	tests := []struct {
		name           string
		courseID       int
		expectedReview []db.ReviewModel
		queryError     error // error return from query
		expectedError  error
	}{
		{
			name:     "return reviews when found",
			courseID: 333,
			expectedReview: []db.ReviewModel{

				{
					InnerReview: db.InnerReview{
						ID:           1,
						CourseID:     333,
						AcademicYear: 2023,
						Description:  "This is a test review",
					},
				},
				{
					InnerReview: db.InnerReview{
						ID:           2,
						CourseID:     333,
						AcademicYear: 2023,
						Description:  "This is a test review",
					},
				},
			},
		},
		{
			name:           "return empty reviews when not found",
			courseID:       444, // should not match with any courseID
			expectedReview: []db.ReviewModel{},
			queryError:     db.ErrNotFound,
		},
		{
			name:           "return nil along with internal server error when error",
			courseID:       9999, // assuming something wrong with db
			expectedReview: nil,
			queryError:     errors.New("something wrong with db"),
			expectedError:  fiber.ErrInternalServerError,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			const (
				testPageSize   = 2
				testPageNumber = 1
			)
			mockExpect := mock.Review.Expect(
				client.Review.FindMany(
					db.Review.CourseID.Equals(test.courseID),
					db.Review.UserID.Not("00000000-0000-0000-0000-000000000000"),
					db.Review.Status.Equals("APPROVED"),
				).With(
					db.Review.Course.Fetch(),
					db.Review.Profile.Fetch(),
				).Take(testPageSize).OrderBy(
					db.Review.CreatedAt.Order(db.SortOrderDesc), // latest reviews FindFirst
				),
			)

			if len(test.expectedReview) != 0 {
				mockExpect.ReturnsMany(test.expectedReview)
			} else if test.queryError != nil {
				mockExpect.Errors(test.queryError)
			}

			reviews, err := getReviews(context.Background(), client, "00000000-0000-0000-0000-000000000000", test.courseID, testPageSize, testPageNumber)

			assert.Equal(t, test.expectedReview, reviews)
			if len(test.expectedReview) != 0 {
				assert.NoError(t, err)
			} else if test.expectedError != nil {
				assert.Equal(t, err.Error(), test.expectedError.Error())
			}
		})
	}
}

func TestGetMyReview(t *testing.T) {
	client, mock, ensure := db.NewMock()
	defer ensure(t)

	tests := []struct {
		name             string
		reviewID         int
		courseID         int
		userID           string
		expectedReviewID int
	}{
		{
			name:             "return my review when found",
			reviewID:         555,
			courseID:         123,
			userID:           "1",
			expectedReviewID: 555,
		},
		{
			name:     "return nil when not found",
			courseID: 123,
			userID:   "2",
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			myReviewChan := make(chan *db.ReviewModel)
			defer close(myReviewChan)
			expected := db.ReviewModel{
				InnerReview: db.InnerReview{
					ID: test.reviewID,
				},
				RelationsReview: db.RelationsReview{
					Course: &db.CourseModel{
						InnerCourse: db.InnerCourse{
							ID:   test.courseID,
							Code: "ITE343",
						},
					},
					Profile: &db.ProfileModel{
						InnerProfile: db.InnerProfile{
							ID: test.userID,
						},
					},
				},
			}

			mockExpect := mock.Review.Expect(
				client.Review.FindFirst(
					db.Review.CourseID.Equals(test.courseID),
					db.Review.UserID.Equals(test.userID),
				).With(
					db.Review.Course.Fetch(),
					db.Review.Profile.Fetch(),
				),
			)

			if test.expectedReviewID != 0 {
				mockExpect.Returns(expected)
			} else {
				mockExpect.Errors(db.ErrNotFound)
			}

			go getMyReview(context.Background(), client, test.userID, test.courseID, 1, myReviewChan)

			actual := <-myReviewChan
			if test.expectedReviewID == 0 {
				assert.Nil(t, actual)
			} else {
				assert.Equal(t, test.expectedReviewID, actual.ID)
			}
		})
	}

	t.Run("only query on first page", func(t *testing.T) {
		t.Skip("TODO: ADD TEST!")
	})
}

func TestIsTermValid(t *testing.T) {

	tests := []struct {
		name          string
		term          int
		expectedError error
	}{
		{
			name: "term 1 should not throw any errror",
			term: 1,
		},
		{
			name: "term 2 should not throw any errror",
			term: 2,
		},
		{
			name: "term 3 should not throw any errror",
			term: 3,
		},
		{
			name:          "term 4 should throw invalid term",
			term:          4,
			expectedError: fiber.NewError(http.StatusBadRequest, "Invalid Term (must be between 1-3)"),
		},
		{
			name:          "term 0 should throw invalid term",
			term:          0,
			expectedError: fiber.NewError(http.StatusBadRequest, "Invalid Term (must be between 1-3)"),
		},
		{
			name:          "term -1 should throw invalid term",
			term:          -1,
			expectedError: fiber.NewError(http.StatusBadRequest, "Invalid Term (must be between 1-3)"),
		},
		{
			name:          "empty term should throw invalid term",
			expectedError: fiber.NewError(http.StatusBadRequest, "Invalid Term (must be between 1-3)"),
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			review := &db.ReviewModel{
				InnerReview: db.InnerReview{
					Term: &test.term,
				}}

			err := isTermValid(review)

			if test.expectedError != nil {
				assert.Error(t, test.expectedError, err)
			} else {
				assert.Nil(t, err)
			}
		})
	}
}

func TestIsSectionValid(t *testing.T) {
	tests := []struct {
		name          string
		section       int
		expectedError error
	}{
		{
			name:    "filled section should not throw any error",
			section: 3,
		},
		{

			name:          "empty section should throw missing section",
			expectedError: fiber.NewError(http.StatusBadRequest, "Missing section"),
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			review := &db.ReviewModel{
				InnerReview: db.InnerReview{
					Section: &test.section,
				},
			}

			err := isSectionValid(review)

			if test.expectedError != nil {
				assert.Error(t, test.expectedError, err)
			} else {
				assert.Nil(t, err)
			}
		})
	}
}

func TestIsActiveUser(t *testing.T) {
	client, mock, ensure := db.NewMock()
	defer ensure(t)

	tests := []struct {
		name     string
		userID   string
		isActive bool
	}{
		{
			name:     "return true when found",
			userID:   "1",
			isActive: true,
		},
		{
			name:   "return false when not found",
			userID: "2",
		},
		{
			name:   "return false when empty",
			userID: "",
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			expected := db.ProfileModel{
				InnerProfile: db.InnerProfile{
					ID:       test.userID,
					IsActive: test.isActive,
				},
			}

			mockExpect := mock.Profile.Expect(
				client.Profile.FindFirst(
					db.Profile.ID.Equals(test.userID),
				),
			)

			if test.isActive {
				mockExpect.Returns(expected)
			} else if test.userID != "" {
				mockExpect.Errors(db.ErrNotFound)
			}

			isActive := isActiveUser(context.Background(), client, test.userID)

			assert.Equal(t, test.isActive, isActive)
		})
	}
}
