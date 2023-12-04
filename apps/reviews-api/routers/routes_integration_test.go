//go:build integration

package routers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/stamford-syntax-club/course-compose/prisma/db"
	"github.com/stamford-syntax-club/course-compose/reviews/handlers"
	"github.com/stamford-syntax-club/course-compose/reviews/utils"
	"github.com/stretchr/testify/assert"
)

func setupTestRouter() (*fiber.App, *db.PrismaClient) {
	client := db.NewClient()
	client.Prisma.Connect()
	h := handlers.New(client)
	app := fiber.New()
	registerRoutes(app, h)
	return app, client
}

func TestPrivateRoutes(t *testing.T) {
	t.Run("test authentication", func(t *testing.T) {
		tests := []struct {
			name                 string
			userID               string
			email                string
			tokenExp             time.Duration
			courseCode           string
			expectedResponseCode int
			expectedErrorMsg     string
		}{
			{
				name:                 "student email should accept",
				userID:               "00000000-0000-0000-0000-000000000001",
				email:                "test@students.stamford.edu",
				tokenExp:             time.Hour * 1,
				courseCode:           "MATH201",
				expectedResponseCode: http.StatusCreated,
			},
			{
				name:                 "non-student email should reject with 401",
				userID:               "00000000-0000-0000-0000-000000000003",
				email:                "someone@stamford.edu",
				tokenExp:             time.Hour * 1,
				courseCode:           "MATH201",
				expectedResponseCode: http.StatusUnauthorized,
				expectedErrorMsg:     "Only Stamford students can access this service",
			},
			{
				name:                 "invalid course code should reject with 400",
				userID:               "00000000-0000-0000-0000-000000000001",
				email:                "test@students.stamford.edu",
				tokenExp:             time.Hour * 1,
				courseCode:           "ITE9999",
				expectedResponseCode: http.StatusBadRequest,
				expectedErrorMsg:     "Course does not exist",
			},
			{
				name:                 "expired token should reject with 401",
				userID:               "00000000-0000-0000-0000-000000000005",
				email:                "testexpired@students.stamford.edu",
				tokenExp:             time.Second * 0,
				courseCode:           "MATH201",
				expectedResponseCode: http.StatusUnauthorized,
				expectedErrorMsg:     "token has invalid claims: token is expired",
			},
		}
		for _, test := range tests {
			t.Run(test.name, func(t *testing.T) {
				var (
					app, client    = setupTestRouter()
					tokenExp       = time.Now().Add(test.tokenExp).Unix()
					token, _       = utils.GenerateNewAccessToken(test.userID, test.email, tokenExp)
					requestBody, _ = json.Marshal(db.RawReviewModel{
						AcademicYear: 2023,
						Description:  "This is a test review",
						Rating:       3,
					},
					)
					req = httptest.NewRequest(http.MethodPost, fmt.Sprintf("/courses/%s/reviews", test.courseCode), bytes.NewBuffer(requestBody))
				)
				defer client.Prisma.Disconnect()
				req.Header.Set("Authorization", "Bearer "+token)
				req.Header.Set("Content-Type", "application/json")

				resp, err := app.Test(req, -1)
				respBody, _ := io.ReadAll(resp.Body)
				defer resp.Body.Close()

				assert.NoError(t, err)
				if test.expectedErrorMsg != "" {
					assert.Equal(t, test.expectedErrorMsg, string(respBody))
				}
				assert.Equal(t, test.expectedResponseCode, resp.StatusCode)
			})
		}
	})
}
