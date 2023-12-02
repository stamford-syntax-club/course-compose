package handlers

import (
	"context"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/lib/pq"
	"github.com/stamford-syntax-club/course-compose/prisma/db"
	"github.com/stamford-syntax-club/course-compose/reviews/data"
)

type H struct {
	client *db.PrismaClient
}

func New(client *db.PrismaClient) *H {
    return &H{client: client}
}

func (h *H) HandleGetReviews(c *fiber.Ctx) error {
	courseCode := c.Params("courseCode")
	ctx, cancelFunc := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancelFunc()

	reviews, err := data.GetAllReviews(ctx, h.client, courseCode)

	if pqErr, ok := err.(*pq.Error); ok {
		log.Println("HandleGetReviews: postgres error:", pqErr)
		return errors.New("Internal server error")
	}

	if err != nil {
		return errors.New(fmt.Sprintf("HandleGetReviews: %v", err))
	}

	return c.JSON(reviews)
}
