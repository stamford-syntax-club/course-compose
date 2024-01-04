package handlers

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
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
	pageSize := c.QueryInt("pageSize", 2)
	pageNumber := c.QueryInt("pageNumber", 1)

	ctx, cancelFunc := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancelFunc()

	userID := utils.GetUserID(c)
	result, err := data.GetCourseReviews(ctx, h.client, courseCode, userID, pageSize, pageNumber)
	if err != nil {
		return err
	}

	return c.Status(http.StatusOK).JSON(result)
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

func (h *H) HandleReviewDecision(c *fiber.Ctx) error {
	reviewDecision := &data.ReviewDecision{}
	if err := c.BodyParser(reviewDecision); err != nil || reviewDecision.ID == 0 || reviewDecision.Status == "" {
		return fiber.NewError(http.StatusBadRequest, "Invalid request body")
	}
	reviewDecision.Status = strings.ToUpper(reviewDecision.Status)

	ctx, cancelFunc := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancelFunc()

	if reviewDecision.Status != "APPROVED" && reviewDecision.Status != "REJECTED" {
		return fiber.NewError(http.StatusBadRequest, "Invalid review status")
	}

	if reviewDecision.Status == "REJECTED" && reviewDecision.RejectedReason == "" {
		return fiber.NewError(http.StatusBadRequest, "Rejected reason is required")
	}

	updatedReview, err := data.UpdateReviewStatus(ctx, h.client, reviewDecision.ID, reviewDecision.Status, reviewDecision.RejectedReason)
	if err != nil {
		return err
	}

	return c.Status(http.StatusOK).JSON(data.ReviewDecision{
		ID:             updatedReview.ID,
		Status:         updatedReview.Status,
		RejectedReason: updatedReview.RejectedReason,
	})
}
