package middleware

import (
	"net/http"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/basicauth"
)

func AdminAuth() func(*fiber.Ctx) error {
	return basicauth.New(basicauth.Config{
		Users: map[string]string{
			os.Getenv("ADMIN_USERNAME"): os.Getenv("ADMIN_PASSWORD"),
		},
		Unauthorized: func(c *fiber.Ctx) error {
			return fiber.NewError(http.StatusUnauthorized, "Only admin users can access this route.")
		},
	})
}
