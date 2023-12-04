package routers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/stamford-syntax-club/course-compose/reviews/handlers"
	"github.com/stamford-syntax-club/course-compose/reviews/middleware"
)

func registerRoutes(app fiber.Router, h *handlers.H) {
	app.Get("/courses/:courseCode/reviews", middleware.JWTAuth(), h.HandleGetReviews)
	app.Post("/courses/:courseCode/reviews", middleware.JWTAuth(), h.HandleSubmitReview)
}
