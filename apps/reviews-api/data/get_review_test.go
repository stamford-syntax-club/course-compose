//go:build unit

package data

import (
	"context"
	"errors"
	"net/http"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stamford-syntax-club/course-compose/prisma/db"
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
			mockExpect := mock.Review.Expect(
				client.Review.FindMany(
					db.Review.CourseID.Equals(test.courseID),
				).With(
					db.Review.Course.Fetch(),
				).Take(2),
			)
			if len(test.expectedReview) != 0 {
				mockExpect.ReturnsMany(test.expectedReview)
			} else if test.queryError != nil {
				mockExpect.Errors(test.queryError)
			}

			reviews, err := getReviews(context.Background(), client, test.courseID, 2, 1)

			assert.Equal(t, test.expectedReview, reviews)
			if len(test.expectedReview) != 0 {
				assert.NoError(t, err)
			} else if test.expectedError != nil {
				assert.Equal(t, err.Error(), test.expectedError.Error())
			}
		})
	}
}

func TestGetMyReviewID(t *testing.T) {
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
			name:             "return my review ID when found",
			reviewID:         555,
			courseID:         123,
			userID:           "1",
			expectedReviewID: 555,
		},
		{
			name:     "return 0 when not found",
			courseID: 123,
			userID:   "2",
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			myReviewIDChan := make(chan int)
			defer close(myReviewIDChan)
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
					User: &db.ActiveUserModel{
						InnerActiveUser: db.InnerActiveUser{
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
				),
			)

			if test.expectedReviewID != 0 {
				mockExpect.Returns(expected)
			} else {
				mockExpect.Errors(db.ErrNotFound)
			}

			go getMyReviewID(context.Background(), client, test.courseID, test.userID, myReviewIDChan)

			assert.Equal(t, test.expectedReviewID, <-myReviewIDChan)
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
			expected := db.ActiveUserModel{
				InnerActiveUser: db.InnerActiveUser{
					ID: test.userID,
				},
			}

			mockExpect := mock.ActiveUser.Expect(
				client.ActiveUser.FindFirst(
					db.ActiveUser.ID.Equals(test.userID),
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

func TestParseReviewJSONResponse(t *testing.T) {
	rawReviewsNoPending := []db.ReviewModel{
		{
			InnerReview: db.InnerReview{
				ID:           1,
				CourseID:     1,
				AcademicYear: 2021,
				Description:  "This is a test review",
			},
			RelationsReview: db.RelationsReview{
				Course: &db.CourseModel{
					InnerCourse: db.InnerCourse{
						ID:   1,
						Code: "ITE343",
					},
				},
			},
		},
		{
			InnerReview: db.InnerReview{
				ID:           2,
				CourseID:     1,
				AcademicYear: 2021,
				Description:  "This is a test review 2",
			},
			RelationsReview: db.RelationsReview{
				Course: &db.CourseModel{
					InnerCourse: db.InnerCourse{
						ID:   1,
						Code: "ITE343",
					},
				},
			},
		},
	}
	rawReviewsWithPending := []db.ReviewModel{
		{
			InnerReview: db.InnerReview{
				ID:           1,
				CourseID:     1,
				AcademicYear: 2021,
				Description:  "This review should be skipped",
				Status:       "PENDING",
			},
			RelationsReview: db.RelationsReview{
				Course: &db.CourseModel{
					InnerCourse: db.InnerCourse{
						ID:   1,
						Code: "ITE343",
					},
				},
				User: &db.ActiveUserModel{
					InnerActiveUser: db.InnerActiveUser{
						ID: "999", // pending and not my review
					},
				},
			},
		},
		{
			InnerReview: db.InnerReview{
				ID:           2,
				CourseID:     1,
				AcademicYear: 2021,
				Description:  "This review should not be skipped",
			},
			RelationsReview: db.RelationsReview{
				Course: &db.CourseModel{
					InnerCourse: db.InnerCourse{
						ID:   1,
						Code: "ITE343",
					},
				},
				User: &db.ActiveUserModel{
					InnerActiveUser: db.InnerActiveUser{
						ID: "1",
					},
				},
			},
		},
	}

	tests := []struct {
		name       string
		myReviewID int
		rawReview  []db.ReviewModel
		expected   []ReviewJSONResponse
	}{
		{
			name:       "correctly parse reviews response (with no matching myReviewID)",
			myReviewID: 0,
			rawReview:  rawReviewsNoPending,
			expected: []ReviewJSONResponse{
				{
					ID:           1,
					AcademicYear: 2021,
					Description:  "This is a test review",
					IsOwner:      false,
					Rating:       0,
					Votes:        0,
					Course: CourseJSONResponse{
						ID:   1,
						Code: "ITE343",
					},
				},
				{
					ID:           2,
					AcademicYear: 2021,
					Description:  "This is a test review 2",
					IsOwner:      false,
					Rating:       0,
					Votes:        0,
					Course: CourseJSONResponse{
						ID:   1,
						Code: "ITE343",
					},
				},
			},
		},
		{
			name:       "show isOwner true if matching myReviewID",
			myReviewID: 1,
			rawReview:  rawReviewsNoPending,
			expected: []ReviewJSONResponse{
				{
					ID:           1,
					AcademicYear: 2021,
					Description:  "This is a test review",
					IsOwner:      true, // reviewID matches with myReviewID
					Rating:       0,
					Votes:        0,
					Course: CourseJSONResponse{
						ID:   1,
						Code: "ITE343",
					},
				},
				{
					ID:           2,
					AcademicYear: 2021,
					Description:  "This is a test review 2",
					IsOwner:      false,
					Rating:       0,
					Votes:        0,
					Course: CourseJSONResponse{
						ID:   1,
						Code: "ITE343",
					},
				},
			},
		},
		{
			name:       "skip pending reviews if not my review",
			myReviewID: 0,
			rawReview:  rawReviewsWithPending,
			expected: []ReviewJSONResponse{
				{
					ID:           2,
					AcademicYear: 2021,
					Description:  "This review should not be skipped",
					IsOwner:      false,
					Course: CourseJSONResponse{
						ID:   1,
						Code: "ITE343",
					},
				},
			},
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			reviewsJSONResponses := parseReviewJSONResponse(test.rawReview, test.myReviewID)

			assert.Equal(t, test.expected, reviewsJSONResponses)
		})
	}
}

func TestGetCourseReviews(t *testing.T) {
	client, mock, ensure := db.NewMock()
	defer ensure(t)

	t.Run("Course is found", func(t *testing.T) {
		var (
			courseCode      = "ITE343"
			courseID        = 333
			nonActiveUserID = "1"
			activeUserID    = "2"

			testPageNumber = 2
			testPageSize   = 10
		)
		mock.Course.Expect(
			client.Course.FindFirst(
				db.Course.Code.Equals(courseCode),
			),
		).Returns(db.CourseModel{
			InnerCourse: db.InnerCourse{
				ID:   courseID,
				Code: courseCode,
			},
		})

		t.Run("force only 2 reviews to be retrived for non-active users", func(t *testing.T) {
			mock.Review.Expect(
				client.Review.FindMany(
					db.Review.CourseID.Equals(courseID),
				).With(
					db.Review.Course.Fetch(),
				).Take(2), // should force only 2 reviews to be retrived regardless the specified vvalue
			).ReturnsMany([]db.ReviewModel{}) // no need for actual data since we're focusing on expectation being met
			mock.ActiveUser.Expect(
				client.ActiveUser.FindFirst(
					db.ActiveUser.ID.Equals(nonActiveUserID),
				),
			).Errors(db.ErrNotFound)
			mock.Review.Expect(
				client.Review.FindFirst(
					db.Review.CourseID.Equals(courseID),
					db.Review.UserID.Equals(nonActiveUserID),
				).With(
					db.Review.Course.Fetch(),
				),
			).Errors(db.ErrNotFound) // mock no my reviewID found for user

			result, err := GetCourseReviews(context.Background(), client, courseCode, nonActiveUserID, testPageSize, testPageNumber)

			assert.NoError(t, err)
			assert.Equal(t, 2, result.PageInformation.Size)
			assert.Equal(t, 1, result.PageInformation.Number)
		})

		t.Run("allow pagination if in active user", func(t *testing.T) {
			mock.Review.Expect(
				client.Review.FindMany(
					db.Review.CourseID.Equals(courseID),
				).With(
					db.Review.Course.Fetch(),
				).Take(testPageSize).Skip((testPageNumber - 1) * testPageSize),
			).ReturnsMany([]db.ReviewModel{})
			mock.ActiveUser.Expect(
				client.ActiveUser.FindFirst(
					db.ActiveUser.ID.Equals(activeUserID),
				),
			).Returns(db.ActiveUserModel{
				InnerActiveUser: db.InnerActiveUser{
					ID: activeUserID,
				},
			})
			mock.Review.Expect(
				client.Review.FindFirst(
					db.Review.CourseID.Equals(courseID),
					db.Review.UserID.Equals(activeUserID),
				).With(
					db.Review.Course.Fetch(),
				),
			).Errors(db.ErrNotFound) // mock no my reviewID found for user

			result, err := GetCourseReviews(context.Background(), client, courseCode, activeUserID, testPageSize, testPageNumber)

			assert.NoError(t, err)
			assert.Equal(t, testPageSize, result.PageInformation.Size)
			assert.Equal(t, testPageNumber, result.PageInformation.Number)
		})

	})
}
