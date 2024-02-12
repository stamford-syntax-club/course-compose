package review_router

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/stamford-syntax-club/course-compose/reviews/common/middleware"
	"github.com/stamford-syntax-club/course-compose/reviews/common/presentation/router"
	review_controller "github.com/stamford-syntax-club/course-compose/reviews/review/domain/controller"
)

type ReviewRouter struct {
	commonRouter *router.FiberRouter
	rc           *review_controller.ReviewController
}

func (r *ReviewRouter) RegisterRoutes() {
	r.commonRouter.Get("/courses/:courseCode/reviews", middleware.JWTAuth(), r.rc.GetReviews)
	r.commonRouter.Post("/courses/:courseCode/reviews", middleware.JWTAuth(), r.rc.SubmitReview)
	r.commonRouter.Put("/courses/:courseCode/reviews/edit", middleware.JWTAuth(), r.rc.EditReview)
	r.commonRouter.Get("/myreviews", middleware.JWTAuth(), r.rc.GetAllMyReviews)
	r.commonRouter.Put("/admin/reviews", middleware.AdminAuth(), r.rc.UpdateReviewStatus)
}

func New(router *router.FiberRouter, rc *review_controller.ReviewController) *ReviewRouter {
	app := fiber.New(fiber.Config{
		AppName: "Course Compose - Reviews",
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError

			var e *fiber.Error
			if errors.As(err, &e) {
				code = e.Code
			}

			if err := c.Status(code).JSON(fiber.Map{
				"status":  code,
				"message": err.Error(),
			}); err != nil {
				return c.SendString("Internal Server Error")
			}

			return nil
		},
	})

	app.Use(cors.New())

	app.Use(logger.New(logger.Config{
		Format: "[${ip}]:${port} ${status} - ${method} ${path}\n",
	}))

	return &ReviewRouter{
		commonRouter: router,
		rc:           rc,
	}
}
