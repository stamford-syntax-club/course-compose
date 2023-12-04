package data

import (
	"context"
	"errors"
	"log"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/stamford-syntax-club/course-compose/prisma/db"
)

func SubmitReview(ctx context.Context, client *db.PrismaClient, courseCode string, review *db.ReviewModel, userID string) error {
	course, err := client.Course.FindFirst(
		db.Course.Code.Equals(courseCode),
	).Exec(ctx)
	if err != nil {
		if errors.Is(err, db.ErrNotFound) {
			return fiber.NewError(http.StatusBadRequest, "Course does not exist")
		}
		log.Println("exec find course query: ", err)
		return fiber.ErrInternalServerError
	}

	if err := hasExistingReview(ctx, client, course.ID, userID); err != nil {
		return err
	}

	if err := addToActiveUser(ctx, client, userID); err != nil {
		return err
	}

	_, err = client.Review.CreateOne(
		db.Review.AcademicYear.Set(review.AcademicYear),
		db.Review.Description.Set(review.Description),
		db.Review.Rating.Set(review.Rating),
		db.Review.Votes.Set(0),
		db.Review.Status.Set("PENDING"),
		db.Review.Course.Link(db.Course.ID.Equals(course.ID)),
		db.Review.User.Link(db.ActiveUser.ID.Equals(userID)),
	).Exec(ctx)
	if err != nil {
		log.Println("exec create review query: ", err)
		return fiber.ErrInternalServerError
	}
	return nil
}

// check if user has already written a review for this course
// returns nil if user has not written a review for this course
// returns error if user has written a review for this course OR there is some problem with the database
func hasExistingReview(ctx context.Context, client *db.PrismaClient, courseID int, userID string) error {
	review, err := client.Review.FindFirst(
		db.Review.CourseID.Equals(courseID),
		db.Review.UserID.Equals(userID),
	).Exec(ctx)
	if err != nil {
		if errors.Is(err, db.ErrNotFound) { // user has not written a review for this course
			return nil
		}
		log.Println("exec find existing review query: ", err)
		return fiber.ErrInternalServerError
	}

	if review != nil {
		return fiber.NewError(http.StatusBadRequest, "You have already written a review for this course")
	}

	return nil
}

// add user to active user table if they are not already there
// this allows us to keep track of users who have written reviews at least once
// activeUser will be able to see more than 2 reviews per course
func addToActiveUser(ctx context.Context, client *db.PrismaClient, userID string) error {
	_, err := client.ActiveUser.UpsertOne(
		db.ActiveUser.ID.Equals(userID),
	).Create(
		db.ActiveUser.ID.Set(userID),
		db.ActiveUser.Username.Set(""),
	).Update(
		db.ActiveUser.ID.Set(userID), // TODO: this is just a placeholder, maybe add field 'number of reviews' and increment it here
	).Exec(ctx)

	if err != nil {
		log.Println("exec upsert active user query: ", err)
		return fiber.ErrInternalServerError
	}
	return nil
}
