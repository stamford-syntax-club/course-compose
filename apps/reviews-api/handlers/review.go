package handlers

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/lib/pq"
	"github.com/stamford-syntax-club/course-compose/prisma/db"
	"github.com/stamford-syntax-club/course-compose/reviews/data"
	"github.com/stamford-syntax-club/course-compose/reviews/utils"
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
		return fiber.ErrInternalServerError
	}

	if err != nil {
		return errors.New(fmt.Sprintf("HandleGetReviews: %v", err))
	}

	return c.Status(http.StatusOK).JSON(reviews)
}

func (h *H) HandleSubmitReview(c *fiber.Ctx) error {
	review := db.ReviewModel{}
	if err := c.BodyParser(&review); err != nil || review.Description == "" || review.AcademicYear == 0 {
		return fiber.NewError(http.StatusBadRequest, "Invalid request body")
	}

	courseCode := c.Params("courseCode")
	if courseCode == "" {
		return fiber.NewError(http.StatusBadRequest, "Invalid course code")
	}

	userID := utils.GetUserID(c)
	if userID == "" {
		return fiber.NewError(http.StatusBadRequest, "Invalid user ID")
	}

	ctx, cancelFunc := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancelFunc()
	if err := data.SubmitReview(ctx, h.client, courseCode, &review, userID); err != nil {
		return err
	}

	return c.Status(http.StatusCreated).JSON("Success")
}
