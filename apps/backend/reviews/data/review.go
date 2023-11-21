package data

import (
	"context"
	"errors"
	"fmt"

	"github.com/stamford-syntax-club/course-compose/prisma/db"
)

func GetAllReviews() ([]db.ReviewModel, error) {
	ctx := context.Background()
	reviews, err := client.Review.FindMany().Exec(ctx)
	if err != nil {
		return nil, errors.New(fmt.Sprintf("GetAllReviews: %v", err))
	}
	return reviews, nil
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
