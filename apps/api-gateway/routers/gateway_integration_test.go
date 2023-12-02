package routers

import (
	"encoding/json"
	"io"
	"net/http"
	"testing"

	"github.com/stamford-syntax-club/course-compose/api-gateway/config"
	"github.com/stretchr/testify/assert"
)

func setupTestGateway(t *testing.T) {
	gatewayConfig, err := config.ReadGatewayConfig("../config/testdata/integration-test.yaml")
	assert.NoError(t, err)

	fiberRouter := NewFiberRouter(":8000", gatewayConfig.Routes)
	go fiberRouter.ListenAndServe()
}

func TestGetMethod(t *testing.T) {
	setupTestGateway(t)

	tests := []struct {
		name                  string
		url                   string
		expectedStatusCode    int
		expectedResponseId    float64
		expectedArrayResponse bool
	}{
		{
			name:               "Test static path",
			url:                "http://localhost:8000/api/integration-test",
			expectedStatusCode: http.StatusOK,
			expectedResponseId: 1,
		},
		{
			name:               "Test dynamic path",
			url:                "http://localhost:8000/api/integration-test/123",
			expectedStatusCode: http.StatusOK,
			expectedResponseId: 123,
		},
		{
			name:               "Test unavailable path",
			url:                "http://localhost:8000/api/integration-fail",
			expectedStatusCode: http.StatusBadGateway,
		},
		{
			name:                  "Test array response",
			url:                   "http://localhost:8000/api/integration-test-array",
			expectedStatusCode:    http.StatusOK,
			expectedArrayResponse: true,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			res, err := http.Get(test.url)
			assert.NoError(t, err)
			assert.Equal(t, test.expectedStatusCode, res.StatusCode)

			// https://jsonplaceholder.typicode.com/todos/:id
			if test.expectedResponseId != 0 {
				body, err := io.ReadAll(res.Body)
				assert.NoError(t, err)

				var responseBody map[string]interface{}
				err = json.Unmarshal(body, &responseBody)
				assert.NoError(t, err)
				assert.Equal(t, test.expectedResponseId, responseBody["id"])
			}

			if test.expectedArrayResponse {
				body, err := io.ReadAll(res.Body)
				assert.NoError(t, err)

				var responseBody []map[string]interface{}
				err = json.Unmarshal(body, &responseBody)
				assert.NoError(t, err)
				assert.True(t, len(responseBody) > 0)
			}
		})
	}
}

// TODO:
func TestPostMethod(t *testing.T) {

}
