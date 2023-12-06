package routers

import (
	"bytes"
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

func TestPostMethod(t *testing.T) {
	setupTestGateway(t)
	url := "http://localhost:8000/api/integration-header"
	reqBody := map[string]interface{}{
		"title":  "foo",
		"body":   "bar",
		"userId": float64(1),
	}

	reqBodyBytes, _ := json.Marshal(reqBody)
	res, err := http.Post(url, "application/json", bytes.NewBuffer(reqBodyBytes))
	assert.NoError(t, err)
	respBody, err := io.ReadAll(res.Body)
	assert.NoError(t, err)
	defer res.Body.Close()

	var respBodyMap map[string]interface{}
	err = json.Unmarshal(respBody, &respBodyMap)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusCreated, res.StatusCode)
	assert.Equal(t, reqBody["title"], respBodyMap["title"])
	assert.Equal(t, reqBody["body"], respBodyMap["body"])
	assert.Equal(t, reqBody["userId"], respBodyMap["userId"])
}
