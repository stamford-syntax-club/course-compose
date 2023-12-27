package utils

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func IsStudent(c *fiber.Ctx) bool {
	user := c.Locals("user")
	if user == nil {
		return false
	}

	token := user.(*jwt.Token)
	claims := token.Claims.(jwt.MapClaims)
	email := claims["email"].(string)
	email_split := strings.Split(email, "@")
	if len(email_split) != 2 {
		return false
	}

	return email_split[1] == "students.stamford.edu"
}

func GetUserID(c *fiber.Ctx) string {
	user := c.Locals("user")
	if user == nil {
		return "00000000-0000-0000-0000-000000000000"
	}

	token := user.(*jwt.Token)
	claims := token.Claims.(jwt.MapClaims)

	return claims["sub"].(string)
}
