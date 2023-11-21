package data

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/stamford-syntax-club/course-compose/prisma/db"
)

func GetAllReviews(courseCode string) ([]ReviewJSONResponse, error) {
	ctx, cancelFunc := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancelFunc()

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
		db.Review.User.Fetch(),
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
			User: UserJSONResponse{
				ID:       review.User().ID,
				Username: review.User().Username,
			},
		})
	}
	return reviewJSONResponses, nil
}

//func CreateNewCourse() {
//	_, err := client.User.CreateOne(
//
//		db.User.Username.Set("Test"),
//		db.User.Email.Set("Test@gmail.com"),
//		db.User.Verified.Set(true),
//	).Exec(context.Background())
//
//	if err != nil {
//		panic(err)
//	}
//
//	_, err = client.Course.CreateOne(
//
//		db.Course.Code.Set(101),
//		db.Course.FullName.Set("Introduction to Information Technology"),
//		db.Course.Prerequisites.Set([]string{}),
//	).Exec(context.Background())
//
//	if err != nil {
//		panic(err)
//	}
//
//	_, err = client.Review.CreateOne(
//
//		db.Review.AcademicYear.Set(2021),
//		db.Review.Description.Set("Test Review"),
//		db.Review.Rating.Set(5),
//		db.Review.Votes.Set(0),
//		db.Review.Status.Set("PENDING"),
//		db.Review.Course.Link(db.Course.ID.Equals(1)),
//		db.Review.User.Link(db.User.ID.Equals(1)),
//	).Exec(context.Background())
//
//	if err != nil {
//		panic(err)
//	}
//}
