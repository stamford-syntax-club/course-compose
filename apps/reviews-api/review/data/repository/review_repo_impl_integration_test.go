//go:build integration

package repository_impl

import (
	"context"
	"log"
	"testing"
	"time"

	"github.com/stamford-syntax-club/course-compose/reviews/common/utils"
	"github.com/stamford-syntax-club/course-compose/reviews/review/data/datasource/db"
	"github.com/stamford-syntax-club/course-compose/reviews/review/domain/dto"
	"github.com/stretchr/testify/suite"
)

type ReviewRepoTestSuite struct {
	ctx       context.Context
	ctxCancel context.CancelFunc
	suite.Suite
	client *db.PrismaClient
}

func (suite *ReviewRepoTestSuite) SetupSuite() {
	suite.client = db.NewClient()
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	suite.ctx = ctx
	suite.ctxCancel = cancel
	err := suite.client.Prisma.Connect()
	suite.NoError(err)
	seedReviewData(suite.client)
}

func (suite *ReviewRepoTestSuite) TearDownSuite() {
	err := suite.client.Prisma.Disconnect()
	suite.NoError(err)
	suite.ctxCancel()
}

func (suite *ReviewRepoTestSuite) TestGetCourseReview() {
	repo := NewReviewRepositoryImpl(suite.client)

	const (
		activeUserID    = "8a7b3c2e-3e5f-4f1a-a8b7-3c2e1a4f5b6d"
		nonActiveUserID = "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d"
	)

	suite.Run("Return nil when course does not exist", func() {
		pageInformation := &utils.PageInformation{
			Size:   2,
			Number: 1,
		}

		result, count, err := repo.GetCourseReviews(suite.ctx, "CHINATHAI999", nonActiveUserID, pageInformation)
		suite.Nil(result)
		suite.Equal(0, count)
		suite.Error(err)
	})

	suite.Run("Return empty for data array when course exists but no reviews", func() {
		pageInformation := &utils.PageInformation{
			Size:   2,
			Number: 1,
		}
		result, count, err := repo.GetCourseReviews(suite.ctx, "NOREVIEW101", nonActiveUserID, pageInformation)

		suite.NoError(err)
		suite.Empty(result)
		suite.Equal(0, count)
	})

	suite.Run("Return reviews as specified by pageSize and pageNumber", func() {
		// Context: There are 4 approved reviews for PHYS101
		firstPageInformation := &utils.PageInformation{
			Size:   4,
			Number: 1,
		}
		firstResult, count, err := repo.GetCourseReviews(suite.ctx, "PHYS101", activeUserID, firstPageInformation)
		suite.NoError(err)

		secondPageInformation := &utils.PageInformation{
			Size:   2,
			Number: 1,
		}
		secondResult, count, err := repo.GetCourseReviews(suite.ctx, "PHYS101", activeUserID, secondPageInformation)
		suite.NoError(err)

		suite.Equal(4, len(firstResult))
		suite.Equal(4, count)

		suite.Equal(2, len(secondResult))
		suite.Equal(4, count)
	})

	suite.Run("Return reviews as is when pageSize is greater than total number of reviews", func() {
		// Context: There are 4 approved reviews for PHYS101
		pageInformation := &utils.PageInformation{
			Size:   10,
			Number: 1,
		}
		result, count, err := repo.GetCourseReviews(suite.ctx, "PHYS101", activeUserID, pageInformation)

		suite.NoError(err)
		suite.Equal(4, len(result))
		suite.Equal(4, count)
	})

	suite.Run("Limit 2 reviews if user is not in activeUser table", func() {
		pageInformation := &utils.PageInformation{
			Size:   10,
			Number: 1,
		}
		result, count, err := repo.GetCourseReviews(suite.ctx, "PHYS101", nonActiveUserID, pageInformation)

		suite.NoError(err)
		suite.Equal(2, len(result)) // only give out 2 reviews for non-active user
		suite.Equal(4, count)
	})

	suite.Run("put myReview as first item in list if exist", func() {
		pageInformation := &utils.PageInformation{
			Size:   2,
			Number: 1,
		}
		userID := "3f9e87a9-6d27-4a09-8a0a-20e58d609315" // this user has myReview for PHYS101
		result, count, err := repo.GetCourseReviews(suite.ctx, "PHYS101", userID, pageInformation)

		suite.NoError(err)
		suite.Equal(3, len(result)) // myReview is included
		suite.Equal(4, count)
		suite.Equal("Yikes!", result[0].Description)
		suite.Equal(float64(2), result[0].Rating)
		suite.Equal(5, result[0].Votes)
	})

	suite.Run("do not query for myReview if not first page", func() {
		pageInformation := &utils.PageInformation{
			Size:   2,
			Number: 2,
		}
		userID := "3f9e87a9-6d27-4a09-8a0a-20e58d609315"
		result, count, err := repo.GetCourseReviews(suite.ctx, "PHYS101", userID, pageInformation)

		suite.NoError(err)
		suite.Equal(1, len(result)) // first page already shows 3 (because myReview was there)
		suite.Equal(4, count)
		suite.NotEqual("Yikes!", result[0].Description)
	})

	suite.Run("Get all my reviews", func() {
		suite.Run("Should return all reviews for specified user", func() {
			userID := "d5a59cb2-1f22-4e23-8ef0-7108e54f842b"
			myReviews, err := repo.GetAllMyReviews(suite.ctx, userID)

			suite.NoError(err)
			suite.Equal(3, len(myReviews))
			suite.Equal(userID, myReviews[0].UserID)
			suite.Equal(userID, myReviews[1].UserID)
			suite.Equal(userID, myReviews[2].UserID)
		})

		suite.Run("Return empty array if token is not provided", func() {
			// 00000000-0000-0000-0000-000000000000 is used if userID cannot be extracted from JWT
			myReviews, err := repo.GetAllMyReviews(suite.ctx, "00000000-0000-0000-0000-000000000000")

			suite.NoError(err)
			suite.Empty(myReviews)
		})
	})
}

func (suite *ReviewRepoTestSuite) TestEditReview() {
	repo := NewReviewRepositoryImpl(suite.client)

	const (
		validCourseCode   = "MATH201"
		invalidCourseCode = "CHINATHAI1234"
		ownerID           = "2d1f3c4e-5a6b-7c8d-9e0f-1a2b3c4d5e6f"
		nonOwnerID        = "6c7b1dd2-aa9d-4f5e-8a98-2c7c2895a95e"
	)

	/*
		        Context: this is the review we are editing
				{
		            id: 2
					academicYear: 2022,
					description:  "The material was challenging but interesting.",
					rating:       4,
					votes:        8,
					status:       "APPROVED",
					courseId:     2,
					userId:       "2d1f3c4e-5a6b-7c8d-9e0f-1a2b3c4d5e6f",
				},
	*/
	targetReview, err := suite.client.Review.FindFirst(db.Review.CourseID.Equals(2), db.Review.UserID.Equals(ownerID)).Exec(suite.ctx)
	suite.NoError(err)
	newReview := &db.ReviewModel{
		InnerReview: db.InnerReview{
			ID:           targetReview.ID,
			AcademicYear: 2023,
			Description:  "Some edited data",
			Rating:       2,
		},
	}

	suite.Run("update review as given in the model and set status back to pending for re-evaluation", func() {
		editedReview, err := repo.EditReview(suite.ctx, newReview, validCourseCode, ownerID)

		suite.NoError(err)
		suite.Equal(newReview.AcademicYear, editedReview.AcademicYear)
		suite.Equal(newReview.Description, editedReview.Description)
		suite.Equal(newReview.Rating, editedReview.Rating)
		suite.Equal("PENDING", editedReview.Status)
	})

	errTest := []struct {
		name       string
		courseCode string
		userId     string
		errMsg     string
	}{
		{
			name:       "return err if user is not owner of the review",
			courseCode: validCourseCode,
			userId:     nonOwnerID,
			errMsg:     "User is not the owner of this review",
		},
		{
			name:       "return err if course does not exist",
			courseCode: invalidCourseCode,
			userId:     ownerID,
			errMsg:     "Course does not exist",
		},
		{
			name:       "return err if user does not exist",
			courseCode: validCourseCode,
			userId:     "9c82c3b5-5b87-4c9b-832d-60d0966d4f7f",
			errMsg:     "User does not exist",
		},
	}

	for _, et := range errTest {
		suite.Run(et.name, func() {
			editedReview, err := repo.EditReview(suite.ctx, newReview, et.courseCode, et.userId)

			suite.Error(err)
			suite.Equal(et.errMsg, err.Error())
			suite.Nil(editedReview)
		})

	}
}

func (suite *ReviewRepoTestSuite) TestSubmitReview() {
	repo := NewReviewRepositoryImpl(suite.client)

	const (
		validCourseCode   = "MATH201"
		invalidCourseCode = "UWU123456"
	)

	suite.Run("should accept if user never writes a review for that course", func() {
		userID := "8b84c3b5-5b87-4c9b-832d-60d0966d4f7d"
		review := &db.ReviewModel{
			InnerReview: db.InnerReview{
				AcademicYear: 2022,
				Description:  "This is a review that should be approved because I've never written one for this course before!",
				Rating:       2,
			},
		}
		result, err := repo.SubmitReview(suite.ctx, review, validCourseCode, userID)

		suite.NoError(err)
		suite.Equal(review.AcademicYear, result.AcademicYear)
		suite.Equal(review.Description, result.Description)
		suite.Equal(review.Rating, result.Rating)
		suite.Equal("PENDING", result.Status)
		suite.Equal(0, result.Votes)
		suite.Equal(userID, result.UserID)
		suite.Equal(2, result.CourseID)
	})

	suite.Run("should reject if the same user tries to submit another review for the same course", func() {
		userID := "8b84c3b5-5b87-4c9b-832d-60d0966d4f7d"
		review := &db.ReviewModel{
			InnerReview: db.InnerReview{
				AcademicYear: 2022,
				Description:  "This is another review of the same course, it should be rejected",
				Rating:       2,
			},
		}
		result, err := repo.SubmitReview(suite.ctx, review, validCourseCode, userID)

		suite.Error(err)
		suite.Equal("You have already written a review for this course", err.Error())
		suite.Nil(result)
	})

	suite.Run("should reject course code does not exist", func() {
		userID := "8b84c3b5-5b87-4c9b-832d-60d0966d4f7d"
		review := &db.ReviewModel{
			InnerReview: db.InnerReview{
				AcademicYear: 2022,
				Description:  "This is another review of the same course, it should be rejected",
				Rating:       2,
			},
		}
		result, err := repo.SubmitReview(suite.ctx, review, invalidCourseCode, userID)

		suite.Error(err)
		suite.Equal("Course does not exist", err.Error())
		suite.Nil(result)
	})

	suite.Run("should reject course code does not exist", func() {
		userID := "8b84c3b5-5b87-4c9b-832d-60d0966d4f7d"
		review := &db.ReviewModel{
			InnerReview: db.InnerReview{
				AcademicYear: 2022,
				Description:  "Some review data",
				Rating:       2,
			},
		}
		result, err := repo.SubmitReview(suite.ctx, review, invalidCourseCode, userID)

		suite.Error(err)
		suite.Equal("Course does not exist", err.Error())
		suite.Nil(result)
	})

	suite.Run("should reject user does not exist", func() {
		userID := "7b84c3b5-5b87-4c9b-832d-60d0966d4f7d" // some random uuid
		review := &db.ReviewModel{
			InnerReview: db.InnerReview{
				AcademicYear: 2022,
				Description:  "Some review data",
				Rating:       2,
			},
		}
		result, err := repo.SubmitReview(suite.ctx, review, validCourseCode, userID)

		suite.Error(err)
		suite.Equal("User does not exist", err.Error())
		suite.Nil(result)
	})
}

func (suite *ReviewRepoTestSuite) TestDeleteReview() {
	repo := NewReviewRepositoryImpl(suite.client)
	ownerId := "3f9e87a9-6d27-4a09-8a0a-20e58d609315"
	nonOwnerId := "d5a59cb2-1f22-4e23-8ef0-7108e54f842b"
	testReview, err := suite.client.Review.CreateOne(
		db.Review.AcademicYear.Set(2099),
		db.Review.Description.Set("To be deleted"),
		db.Review.Rating.Set(2.0),
		db.Review.Votes.Set(0),
		db.Review.Status.Set("REJECTED"),
		db.Review.Course.Link(db.Course.ID.Equals(1)),
		db.Review.Profile.Link(db.Profile.ID.Equals(ownerId)),
	).Exec(suite.ctx)
	suite.NoError(err)

	suite.Run("user is not review owner", func() {
		err := repo.DeleteReview(suite.ctx, testReview.ID, "CSCI101", nonOwnerId)
		suite.Error(err)
		suite.Equal("User is not the owner of this review", err.Error())
	})

	suite.Run("user is review owner", func() {
		err := repo.DeleteReview(suite.ctx, testReview.ID, "CSCI101", ownerId)
		suite.NoError(err)
	})
}

func (suite *ReviewRepoTestSuite) TestUpdateReviewStatus() {
	repo := NewReviewRepositoryImpl(suite.client)

	const nonActiveUser = "2b84c3b5-5b87-4c9b-832d-60d0966d4f7d"
	const activeUser = "8a7b3c2e-3e5f-4f1a-a8b7-3c2e1a4f5b6d"

	suite.Run("update user active status if review is approved", func() {
		suite.Run("first time getting their review approved", func() {
			// user is initially inactive
			owner, err := suite.client.Profile.FindUnique(
				db.Profile.ID.Equals(nonActiveUser),
			).Exec(suite.ctx)
			suite.NoError(err)
			suite.False(owner.IsActive)

			pendingReview, err := suite.client.Review.FindFirst(
				db.Review.UserID.Equals(nonActiveUser),
				db.Review.Description.Contains("I will be approved soon"),
			).Exec(suite.ctx)

			reviewDecision := &dto.ReviewDecisionDTO{
				ID:     pendingReview.ID,
				Status: "APPROVED",
			}
			updatedReview, err := repo.UpdateReviewStatus(suite.ctx, reviewDecision)
			suite.NoError(err)
			suite.Equal("APPROVED", updatedReview.Status)

			// check if user is now active after getting their review approved
			owner, err = suite.client.Profile.FindUnique(
				db.Profile.ID.Equals(nonActiveUser),
			).Exec(suite.ctx)
			suite.NoError(err)
			suite.True(owner.IsActive)
		})
	})

	suite.Run("should not matter if user is already active", func() {
		// user is already active
		owner, err := suite.client.Profile.FindUnique(
			db.Profile.ID.Equals(activeUser),
		).Exec(suite.ctx)
		suite.NoError(err)
		suite.True(owner.IsActive)

		pendingReview, err := suite.client.Review.FindFirst(
			db.Review.UserID.Equals(activeUser),
			db.Review.Description.Contains("Another review from 8a7b3c"),
		).Exec(suite.ctx)

		reviewDecision := &dto.ReviewDecisionDTO{
			ID:     pendingReview.ID,
			Status: "APPROVED",
		}
		updatedReview, err := repo.UpdateReviewStatus(suite.ctx, reviewDecision)
		suite.NoError(err)
		suite.Equal("APPROVED", updatedReview.Status)

		// check if user is now active after getting their review approved
		owner, err = suite.client.Profile.FindUnique(
			db.Profile.ID.Equals(activeUser),
		).Exec(suite.ctx)
		suite.NoError(err)
		suite.True(owner.IsActive)
	})
}

func TestReviewRepoSuite(t *testing.T) {
	suite.Run(t, new(ReviewRepoTestSuite))
}

func seedReviewData(client *db.PrismaClient) {
	ctx, cancelFunc := context.WithTimeout(context.Background(), time.Second*3)
	defer cancelFunc()
	reviews := []struct {
		academicYear int
		description  string
		rating       float64
		votes        int
		status       string
		courseId     int
		userId       string
	}{
		{
			academicYear: 2022,
			description:  "Great course, highly recommended!",
			rating:       5,
			votes:        10,
			status:       "APPROVED",
			courseId:     1,
			userId:       "8a7b3c2e-3e5f-4f1a-a8b7-3c2e1a4f5b6d",
		},
		{
			academicYear: 2022,
			description:  "The material was challenging but interesting.",
			rating:       4,
			votes:        8,
			status:       "APPROVED",
			courseId:     2,
			userId:       "2d1f3c4e-5a6b-7c8d-9e0f-1a2b3c4d5e6f",
		},
		{
			academicYear: 2022,
			description:  "Not a fan of the teaching style.",
			rating:       2,
			votes:        5,
			status:       "PENDING",
			courseId:     3,
			userId:       "2d1f3c4e-5a6b-7c8d-9e0f-1a2b3c4d5e6f",
		},
		{
			academicYear: 2022,
			description:  "I'm just here to fill up spaces XD",
			rating:       2,
			votes:        5,
			status:       "APPROVED",
			courseId:     3,
			userId:       "8b84c3b5-5b87-4c9b-832d-60d0966d4f7d",
		},
		{
			academicYear: 2022,
			description:  "Me too!",
			rating:       2,
			votes:        5,
			status:       "APPROVED",
			courseId:     3,
			userId:       "d5a59cb2-1f22-4e23-8ef0-7108e54f842b",
		},
		{
			academicYear: 2022,
			description:  "Hello world!",
			rating:       2,
			votes:        5,
			status:       "APPROVED",
			courseId:     3,
			userId:       "6c7b1dd2-aa9d-4f5e-8a98-2c7c2895a95e",
		},
		{
			academicYear: 2022,
			description:  "Yikes!",
			rating:       2,
			votes:        5,
			status:       "APPROVED",
			courseId:     3,
			userId:       "3f9e87a9-6d27-4a09-8a0a-20e58d609315",
		},
		{
			academicYear: 2022,
			description:  "So Good!",
			rating:       5,
			votes:        0,
			status:       "PENDING",
			courseId:     5,
			userId:       "d5a59cb2-1f22-4e23-8ef0-7108e54f842b",
		},
		{
			academicYear: 2022,
			description:  "WOWWW!",
			rating:       5,
			votes:        0,
			status:       "REJECTED",
			courseId:     1,
			userId:       "d5a59cb2-1f22-4e23-8ef0-7108e54f842b",
		},
		{
			academicYear: 9999,
			description:  "I will be approved soon",
			rating:       3,
			status:       "PENDING",
			courseId:     1,
			userId:       "2b84c3b5-5b87-4c9b-832d-60d0966d4f7d",
		},
		{
			academicYear: 2022,
			description:  "Another review from 8a7b3c",
			rating:       5,
			votes:        10,
			status:       "PENDING",
			courseId:     5,
			userId:       "8a7b3c2e-3e5f-4f1a-a8b7-3c2e1a4f5b6d",
		},
	}

	for _, review := range reviews {
		_, err := client.Review.CreateOne(
			db.Review.AcademicYear.Set(review.academicYear),
			db.Review.Description.Set(review.description),
			db.Review.Rating.Set(review.rating),
			db.Review.Votes.Set(review.votes),
			db.Review.Status.Set(review.status),
			db.Review.Course.Link(db.Course.ID.Equals(review.courseId)),
			db.Review.Profile.Link(db.Profile.ID.Equals(review.userId)),
		).Exec(ctx)
		if err != nil {
			log.Fatalln("seeding review: ", err)
		}
	}

	log.Println("seeded data successfully!")
}
