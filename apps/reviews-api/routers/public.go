package routers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/stamford-syntax-club/course-compose/reviews/handlers"
)

func registerPublicRoutes(app fiber.Router, h *handlers.H) {
    app.Get("/courses/:courseCode/reviews", h.HandleGetReviews)
}
