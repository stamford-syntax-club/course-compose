package middleware

import (
	"net/http"
	"os"

	jwtMiddleware "github.com/gofiber/contrib/jwt"
	"github.com/gofiber/fiber/v2"
	"github.com/stamford-syntax-club/course-compose/reviews/common/utils"
)

func JWTAuth() func(*fiber.Ctx) error {
	config := jwtMiddleware.Config{
		SigningKey:     jwtMiddleware.SigningKey{Key: []byte(os.Getenv("JWT_SECRET"))},
		ContextKey:     "user",
		SuccessHandler: jwtSuccess,
		ErrorHandler:   jwtError,
	}

	return jwtMiddleware.New(config)
}

func jwtSuccess(c *fiber.Ctx) error {
	if !utils.IsStudent(c) {
		return fiber.NewError(http.StatusUnauthorized, "Only Stamford students can access this service")
	}
	return c.Next()
}

func jwtError(c *fiber.Ctx, err error) error {
	// in case of seeing reviews, give guess access if no token
	if err.Error() == "missing or malformed JWT" && c.Method() == http.MethodGet {
		return c.Next()
	}

	// Return status 401 and failed authentication error.
	return fiber.NewError(http.StatusUnauthorized, err.Error())
}
