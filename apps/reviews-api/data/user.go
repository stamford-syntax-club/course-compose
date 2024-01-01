package data

import (
	"context"
	"errors"
	"log"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/stamford-syntax-club/course-compose/prisma/db"
)

func getUser(ctx context.Context, client *db.PrismaClient, userID string) (*db.ProfileModel, error) {
	user, err := client.Profile.FindFirst(
		db.Profile.ID.Equals(userID),
	).Exec(ctx)
	if err != nil {
		if errors.Is(err, db.ErrNotFound) {
			return nil, fiber.NewError(http.StatusBadRequest, "User does not exist")
		}
		return nil, fiber.ErrInternalServerError
	}

	return user, nil
}

func isActiveUser(ctx context.Context, client *db.PrismaClient, userID string) bool {
	if userID == "" {
		return false
	}

	user, err := client.Profile.FindFirst(
		db.Profile.ID.Equals(userID),
	).Exec(ctx)
	if err != nil {
		if !errors.Is(err, db.ErrNotFound) {
			log.Println("exec find active user query: ", err)
		}
		return false
	}

	return user.IsActive
}
