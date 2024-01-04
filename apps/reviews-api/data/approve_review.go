package data

import (
	"context"
	"errors"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/stamford-syntax-club/course-compose/prisma/db"
)

func ApproveReview(ctx context.Context, client *db.PrismaClient, reviewID int) (*db.ReviewModel, error) {
	updatedReview, err := client.Review.FindUnique(
		db.Review.ID.Equals(reviewID),
	).Update(
		db.Review.Status.Set("APPROVED"),
	).Exec(ctx)

	if err != nil {
		if errors.Is(err, db.ErrNotFound) {
			return nil, fiber.ErrNotFound
		}
		log.Println("exec update review status:", err)
		return nil, fiber.ErrInternalServerError
	}

	return updatedReview, nil
}
