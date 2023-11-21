package handlers

import (
	"errors"
	"fmt"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/lib/pq"
	"github.com/stamford-syntax-club/course-compose/reviews/data"
)

func HandleGetReviews(c *fiber.Ctx) error {
	courseCode := c.Params("courseCode")
	reviews, err := data.GetAllReviews(courseCode)
	if len(reviews) == 0 {
		return fiber.NewError(fiber.StatusNotFound, fmt.Sprintf("No reviews found for course %s", courseCode))
	}

	if pqErr, ok := err.(*pq.Error); ok {
		log.Println("HandleGetReviews: postgres error:", pqErr)
		return errors.New("Internal server error")
	}

	if err != nil {
		return errors.New(fmt.Sprintf("HandleGetReviews: %v", err))
	}

	return c.JSON(reviews)
}
