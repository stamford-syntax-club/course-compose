package review_controller

import (
	"context"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/stamford-syntax-club/course-compose/reviews/common/utils"
	"github.com/stamford-syntax-club/course-compose/reviews/review/data/datasource/db"
	"github.com/stamford-syntax-club/course-compose/reviews/review/domain/dto"
	review_repo "github.com/stamford-syntax-club/course-compose/reviews/review/domain/repository"
)

type ReviewController struct {
	reviewRepo review_repo.ReviewRepository
}

func NewReviewController(reviewRepo review_repo.ReviewRepository) *ReviewController {
	return &ReviewController{
		reviewRepo: reviewRepo,
	}
}

func (rc *ReviewController) GetReviews(c *fiber.Ctx) error {
	courseCode := c.Params("courseCode")
	pageSize := c.QueryInt("pageSize", 2)
	pageNumber := c.QueryInt("pageNumber", 1)

	ctx, cancelFunc := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancelFunc()

	userID := utils.GetUserID(c)

	pageInformation := &utils.PageInformation{
		Size:   pageSize,
		Number: pageNumber,
	}

	rawReviews, count, err := rc.reviewRepo.GetCourseReviews(ctx, courseCode, userID, pageInformation)
	if err != nil {
		return err
	}

	reviews := dto.MapReviewToReviewDTO(rawReviews, userID)

	result := utils.NewPagination(reviews, count, pageInformation)

	return c.Status(http.StatusOK).JSON(result)
}

func (rc *ReviewController) GetAllMyReviews(c *fiber.Ctx) error {
	ctx, cancelFunc := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancelFunc()

	userID := utils.GetUserID(c)

	// TODO: great new joiner task to implement pagination
	pageInformation := &utils.PageInformation{
		Size:   9999,
		Number: 1,
	}

	rawReviews, err := rc.reviewRepo.GetAllMyReviews(ctx, userID)
	if err != nil {
		return err
	}

	reviews := dto.MapReviewToReviewDTO(rawReviews, userID)

	result := utils.NewPagination(reviews, len(reviews), pageInformation)

	return c.Status(http.StatusOK).JSON(result)
}

func (rc *ReviewController) SubmitReview(c *fiber.Ctx) error {
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
	result, err := rc.reviewRepo.SubmitReview(ctx, &review, courseCode, userID)
	if err != nil {
		return err
	}

	return c.Status(http.StatusCreated).JSON(result)
}

func (rc *ReviewController) EditReview(c *fiber.Ctx) error {
	review := db.ReviewModel{}
	// require review id for validating ownership
	if err := c.BodyParser(&review); err != nil || review.ID == 0 || review.Description == "" || review.AcademicYear == 0 {
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
	result, err := rc.reviewRepo.EditReview(ctx, &review, courseCode, userID)
	if err != nil {
		return err
	}

	return c.Status(http.StatusOK).JSON(result)
}

func (rc *ReviewController) UpdateReviewStatus(c *fiber.Ctx) error {
	reviewDecision := &dto.ReviewDecisionDTO{}
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

	result, err := rc.reviewRepo.UpdateReviewStatus(ctx, reviewDecision)
	if err != nil {
		return err
	}

	return c.Status(http.StatusOK).JSON(result)
}

func (rc *ReviewController) DeleteReview(c *fiber.Ctx) error {
	courseCode := c.Params("courseCode")
	if courseCode == "" {
		return fiber.NewError(http.StatusBadRequest, "Invalid course code")
	}

	reviewId, err := c.ParamsInt("reviewId", 0)
	if reviewId == 0 || err != nil {
		if err != nil {
			log.Printf("err delete review param: %v", err)
		}

		return fiber.NewError(http.StatusBadRequest, "Required review id")
	}

	userId := utils.GetUserID(c)
	if userId == "" {
		return fiber.NewError(http.StatusBadRequest, "Invalid user ID")
	}

	ctx, cancleFunc := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancleFunc()
	err = rc.reviewRepo.DeleteReview(ctx, reviewId, courseCode, userId)
	if err != nil {
		return err
	}

	return c.SendStatus(http.StatusNoContent)
}
