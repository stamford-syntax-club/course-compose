package routers

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
)

func TestGetAllReviews(t *testing.T) {
	app := fiber.New()
	api := app.Group("/api")
	registerPublicRoutes(api)

	req := httptest.NewRequest(http.MethodGet, "/api/ITE101/reviews", http.NoBody)
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req, -1)

	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)
}
