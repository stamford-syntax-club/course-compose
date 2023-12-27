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
					db.Review.UserID.Not("00000000-0000-0000-0000-000000000000"),
					db.Review.Status.Equals("APPROVED"),
				).With(
					db.Review.Course.Fetch(),
					db.Review.Profile.Fetch(),
				).OrderBy(
					db.Review.CreatedAt.Order(db.SortOrderDesc), // latest reviews FindFirst
				),
			)
			if len(test.expectedReview) != 0 {
				mockExpect.ReturnsMany(test.expectedReview)
			} else if test.queryError != nil {
				mockExpect.Errors(test.queryError)
			}

			reviews, err := getReviews(context.Background(), client, "00000000-0000-0000-0000-000000000000", test.courseID)

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

			go getMyReview(context.Background(), client, test.courseID, test.userID, myReviewChan)

			actual := <-myReviewChan
			if test.expectedReviewID == 0 {
				assert.Nil(t, actual)
			} else {
				assert.Equal(t, test.expectedReviewID, actual.ID)
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
	const (
		courseID   = 333
		courseCode = "ITE343"
		myUserID   = "1"
	)
	reviewsData := []db.ReviewModel{
		{
			InnerReview: db.InnerReview{
				ID:           2,
				AcademicYear: 2023,
				Description:  "This is a review from someone else",
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
		reviewsJSONResponses := parseReviewJSONResponse([]db.ReviewModel{}, nil)

		assert.Equal(t, []ReviewJSONResponse{}, reviewsJSONResponses)
	})

	t.Run("return correct reviewJSONResponses when non-empty reviews", func(t *testing.T) {
		reviewsJSONResponses := parseReviewJSONResponse(reviewsData, nil)

		assert.Equal(t, 2, len(reviewsJSONResponses))
		assert.Equal(t, reviewsData[0].ID, reviewsJSONResponses[0].ID)
		assert.Equal(t, reviewsData[0].AcademicYear, reviewsJSONResponses[0].AcademicYear)
		assert.Equal(t, reviewsData[0].Description, reviewsJSONResponses[0].Description)
		assert.Equal(t, reviewsData[0].RelationsReview.Course.Code, reviewsJSONResponses[0].Course.Code)
		assert.Equal(t, reviewsData[0].RelationsReview.Profile.ID, reviewsJSONResponses[0].Profile.ID)
		assert.Equal(t, reviewsData[1].ID, reviewsJSONResponses[1].ID)
		assert.Equal(t, reviewsData[1].AcademicYear, reviewsJSONResponses[1].AcademicYear)
		assert.Equal(t, reviewsData[1].Description, reviewsJSONResponses[1].Description)
		assert.Equal(t, reviewsData[1].RelationsReview.Course.Code, reviewsJSONResponses[1].Course.Code)
		assert.Equal(t, reviewsData[1].RelationsReview.Profile.ID, reviewsJSONResponses[1].Profile.ID)
	})

	t.Run("put myReview as first item in list if exist", func(t *testing.T) {
		myReview := &db.ReviewModel{
			InnerReview: db.InnerReview{
				ID:           1,
				AcademicYear: 2023,
				Description:  "This is my review",
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
						ID: myUserID,
					},
				},
			},
		}

		reviewsJSONResponses := parseReviewJSONResponse(reviewsData, myReview)

		assert.Equal(t, myReview.ID, reviewsJSONResponses[0].ID)
	})
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
			reviewsData     = []db.ReviewModel{
				{
					InnerReview: db.InnerReview{
						ID:           2,
						AcademicYear: 2023,
						Description:  "This is a review from someone else",
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
				{
					InnerReview: db.InnerReview{
						ID:           4,
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
								ID: "4",
							},
						},
					},
				},
			}
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
			var (
				testPageNumber = 5
				testPageSize   = 10
			)
			mock.Review.Expect(
				client.Review.FindMany(
					db.Review.CourseID.Equals(courseID),
					db.Review.UserID.Not(nonActiveUserID),
					db.Review.Status.Equals("APPROVED"),
				).With(
					db.Review.Course.Fetch(),
					db.Review.Profile.Fetch(),
				).OrderBy(
					db.Review.CreatedAt.Order(db.SortOrderDesc),
				),
			).ReturnsMany(reviewsData)
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
					db.Review.Profile.Fetch(),
				),
			).Errors(db.ErrNotFound) // mock no my reviewID found for user

			result, err := GetCourseReviews(context.Background(), client, courseCode, nonActiveUserID, testPageSize, testPageNumber)
			data, ok := result.Data.([]ReviewJSONResponse)

			assert.NoError(t, err)
			assert.True(t, ok)
			assert.Equal(t, 2, result.PageInformation.Size)
			assert.Equal(t, 1, result.PageInformation.Number)
			assert.Equal(t, 2, result.TotalNumberOfItems) // force to 2 reviews, though there are 3 reviews in db
			assert.Equal(t, 2, len(data))                 // force to 2 reviews, though there are 3 reviews in db
		})

		t.Run("allow pagination if in active user", func(t *testing.T) {
			var (
				testPageNumber = 1
				testPageSize   = 3
			)
			mock.Review.Expect(
				client.Review.FindMany(
					db.Review.CourseID.Equals(courseID),
					db.Review.UserID.Not(activeUserID),
					db.Review.Status.Equals("APPROVED"),
				).With(
					db.Review.Course.Fetch(),
					db.Review.Profile.Fetch(),
				).OrderBy(
					db.Review.CreatedAt.Order(db.SortOrderDesc),
				),
			).ReturnsMany(reviewsData)
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
					db.Review.Profile.Fetch(),
				),
			).Errors(db.ErrNotFound) // mock no my reviewID found for user

			result, err := GetCourseReviews(context.Background(), client, courseCode, activeUserID, testPageSize, testPageNumber)
			data, ok := result.Data.([]ReviewJSONResponse)

			assert.NoError(t, err)
			assert.True(t, ok)
			assert.Equal(t, testPageSize, result.PageInformation.Size)
			assert.Equal(t, testPageNumber, result.PageInformation.Number)
			assert.Equal(t, 3, result.TotalNumberOfItems)
			assert.Equal(t, 3, len(data))
		})

		t.Run("increment totalNumberOfItems if myReview exists", func(t *testing.T) {
			activeUserID = "4"
			mock.Review.Expect(
				client.Review.FindMany(
					db.Review.CourseID.Equals(courseID),
					db.Review.UserID.Not(activeUserID),
					db.Review.Status.Equals("APPROVED"),
				).With(
					db.Review.Course.Fetch(),
					db.Review.Profile.Fetch(),
				).OrderBy(
					db.Review.CreatedAt.Order(db.SortOrderDesc),
				),
			).ReturnsMany(reviewsData)
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
					db.Review.Profile.Fetch(),
				),
			).Returns(db.ReviewModel{
				InnerReview: db.InnerReview{
					ID: 1,
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
							ID: activeUserID,
						},
					},
				},
			})

			result, err := GetCourseReviews(context.Background(), client, courseCode, activeUserID, 10, 1)

			assert.NoError(t, err)
			assert.Equal(t, 4, result.TotalNumberOfItems)
		})

		t.Run("return empty reviews if offset is greater than total number of reviews", func(t *testing.T) {
			activeUserID = "5"
			mock.Review.Expect(
				client.Review.FindMany(
					db.Review.CourseID.Equals(courseID),
					db.Review.UserID.Not(activeUserID),
					db.Review.Status.Equals("APPROVED"),
				).With(
					db.Review.Course.Fetch(),
					db.Review.Profile.Fetch(),
				).OrderBy(
					db.Review.CreatedAt.Order(db.SortOrderDesc),
				),
			).ReturnsMany(reviewsData)
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
					db.Review.Profile.Fetch(),
				),
			).Returns(db.ReviewModel{
				InnerReview: db.InnerReview{
					ID: 1,
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
							ID: activeUserID,
						},
					},
				},
			})

			result, err := GetCourseReviews(context.Background(), client, courseCode, activeUserID, 10, 2) // pageNumber is now 2 - offset is 10

			assert.NoError(t, err)
			assert.Equal(t, 4, result.TotalNumberOfItems)
			assert.Equal(t, 0, len(result.Data.([]ReviewJSONResponse)))
		})
	})
}
