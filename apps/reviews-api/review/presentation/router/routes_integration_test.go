//go:build integration

package review_router

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/stamford-syntax-club/course-compose/reviews/common/presentation/router"
	"github.com/stamford-syntax-club/course-compose/reviews/common/utils"
	"github.com/stamford-syntax-club/course-compose/reviews/review/data/datasource/db"
	repository_impl "github.com/stamford-syntax-club/course-compose/reviews/review/data/repository"
	review_controller "github.com/stamford-syntax-club/course-compose/reviews/review/domain/controller"
	"github.com/stretchr/testify/assert"
)

func setupTestRouter() (*fiber.App, *db.PrismaClient) {
	client := db.NewClient()
	client.Prisma.Connect()

	reviewRepo := repository_impl.NewReviewRepositoryImpl(client)
	reviewController := review_controller.NewReviewController(reviewRepo)

	router := router.NewFiberRouter()
	reviewRouter := New(router, reviewController)

	reviewRouter.RegisterRoutes()

	return router.App, client
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
				userID:               "8a7b3c2e-3e5f-4f1a-a8b7-3c2e1a4f5b6d",
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
				userID:               "8a7b3c2e-3e5f-4f1a-a8b7-3c2e1a4f5b6d",
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
					req = httptest.NewRequest(http.MethodPost, fmt.Sprintf("/api/courses/%s/reviews", test.courseCode), bytes.NewBuffer(requestBody))
				)
				defer client.Prisma.Disconnect()
				req.Header.Set("Authorization", "Bearer "+token)
				req.Header.Set("Content-Type", "application/json")

				resp, err := app.Test(req, -1)
				respBody, _ := io.ReadAll(resp.Body)
				defer resp.Body.Close()

				assert.NoError(t, err)
				if test.expectedErrorMsg != "" {
					var result struct {
						Message string `json:"message"`
					}
					err := json.Unmarshal(respBody, &result)
					assert.NoError(t, err)
					assert.Equal(t, test.expectedErrorMsg, result.Message)
				}
				assert.Equal(t, test.expectedResponseCode, resp.StatusCode)
			})
		}
	})
}

func TestAdminRoutes(t *testing.T) {
	app, client := setupTestRouter()
	defer client.Prisma.Disconnect()
	t.Run("only admin can access admin routes", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPut, "/admin/reviews", nil)

		resp, err := app.Test(req, -1)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
	})

	t.Run("Test Update Review Status", func(t *testing.T) {
		tests := []struct {
			name                 string
			requestBody          map[string]interface{}
			expectedResponseCode int
		}{
			{
				name: "return 200 if review status is updated",
				requestBody: map[string]interface{}{
					"id":     2,
					"status": "APPROVED",
				},
				expectedResponseCode: http.StatusOK,
			},
			{
				name: "return 200 if review status is rejected",
				requestBody: map[string]interface{}{
					"id":             2,
					"status":         "REJECTED",
					"rejectedReason": "This is a test rejected reason",
				},
				expectedResponseCode: http.StatusOK,
			},
			{
				name: "auto force uppercase status",
				requestBody: map[string]interface{}{
					"id":     2,
					"status": "approved",
				},
				expectedResponseCode: http.StatusOK,
			},
			{
				name: "return 400 if status is missing from request body",
				requestBody: map[string]interface{}{
					"id": 2,
				},
				expectedResponseCode: http.StatusBadRequest,
			},
			{
				name: "return 400 if id is missing from request body",
				requestBody: map[string]interface{}{
					"status": "APPROVED",
				},
				expectedResponseCode: http.StatusBadRequest,
			},
			{
				name: "return 400 if status is not valid",
				requestBody: map[string]interface{}{
					"id":     2,
					"status": "invalid",
				},
				expectedResponseCode: http.StatusBadRequest,
			},
			{
				name: "return 400 if status is rejected but rejected reason is missing",
				requestBody: map[string]interface{}{
					"id":     2,
					"status": "REJECTED",
				},
				expectedResponseCode: http.StatusBadRequest,
			},
		}

		for _, test := range tests {
			t.Run(test.name, func(t *testing.T) {
				requestBody, _ := json.Marshal(test.requestBody)
				req := httptest.NewRequest(http.MethodPut, "/admin/reviews", bytes.NewBuffer(requestBody))
				req.Header.Set("Content-Type", "application/json")
				// TODO: UpdatReviewStatus is misssing basic auth on the header
				auth := base64.StdEncoding.EncodeToString([]byte(os.Getenv("ADMIN_USERNAME") + ":" + os.Getenv("ADMIN_PASSWORD")))
				req.Header.Set("Authorization", "Basic "+auth)

				resp, err := app.Test(req, -1)
				respBody, _ := io.ReadAll(resp.Body)
				defer resp.Body.Close()

				assert.NoError(t, err)
				assert.Equal(t, test.expectedResponseCode, resp.StatusCode)
				if test.expectedResponseCode == http.StatusOK {
					var updatedReview db.ReviewModel
					err := json.Unmarshal(respBody, &updatedReview)
					assert.NoError(t, err)
					assert.Equal(t, test.requestBody["id"], updatedReview.ID)
					assert.Equal(t, strings.ToUpper(test.requestBody["status"].(string)), updatedReview.Status)
					if test.requestBody["status"] == "rejected" {
						assert.NotEmpty(t, updatedReview.RejectedReason)
					}
				}
			})
		}
	})
}
