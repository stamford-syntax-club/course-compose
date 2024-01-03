package routers

import (
	"errors"
	"log"
	"os"
	"os/signal"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/stamford-syntax-club/course-compose/api-gateway/config"
)

type FiberRouter struct {
	*fiber.App
	port string
}

func NewFiberRouter(port string, routes []config.Route) *FiberRouter {
	app := fiber.New(fiber.Config{
		AppName: "Course Compose - API Gateway",
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

	app.Hooks().OnRoute(func(r fiber.Route) error {
		if r.Method != "HEAD" {
			log.Printf("Registering route: %s - %s ...", r.Method, r.Path)
		}
		return nil
	})
	app = registerRoutes(app, routes)

	return &FiberRouter{
		App:  app,
		port: port,
	}
}

func (r *FiberRouter) ListenAndServe() error {
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	go func() {
		<-c
		log.Println("Gracefully shutting down...")
		r.App.Shutdown()
	}()

	return r.App.Listen(r.port)
}
