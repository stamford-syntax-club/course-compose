package routers

import (
	"log"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stamford-syntax-club/course-compose/prisma/db"
	"github.com/stamford-syntax-club/course-compose/reviews/config"
	"github.com/stamford-syntax-club/course-compose/reviews/handlers"
	"github.com/stretchr/testify/assert"
)

var (
	app    *fiber.App
	testClient *db.PrismaClient
)

func setupTest() {
    if err := config.LoadEnvFile("test"); err != nil {
        log.Fatalf("load env file: %v", err)
    }
	testClient = db.NewClient()
	if err := testClient.Prisma.Connect(); err != nil {
		log.Fatalf("Prisma Connect: %v", err)
	}

	h := handlers.New(testClient)

	app = fiber.New()
	registerPublicRoutes(app, h)
}

func TestGetAllReviews(t *testing.T) {
	setupTest()
	defer testClient.Prisma.Disconnect()
	req := httptest.NewRequest(http.MethodGet, "/ITE101/reviews", http.NoBody)
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req, -1)

	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)
}
