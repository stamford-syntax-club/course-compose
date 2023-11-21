package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/stamford-syntax-club/course-compose/reviews/data"
)

func HandleGetReviews(c *fiber.Ctx) error {
    reviews, err := data.GetAllReviews()
    if err != nil {
        return err
    }

    return c.JSON(reviews)
}
