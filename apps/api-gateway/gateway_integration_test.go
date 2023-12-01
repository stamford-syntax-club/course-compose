package main

import (
	"encoding/json"
	"io"
	"net/http"
	"testing"

	"github.com/stamford-syntax-club/course-compose/api-gateway/config"
	"github.com/stamford-syntax-club/course-compose/api-gateway/routers"
	"github.com/stretchr/testify/assert"
)

func setupTestGateway(t *testing.T) {
	gatewayConfig, err := config.ReadGatewayConfig("config/testdata/integration-test.yaml")
	assert.NoError(t, err)

	fiberRouter := routers.NewFiberRouter(":8000", gatewayConfig.Routes)
	go fiberRouter.ListenAndServe()
}

func TestAPIGateway(t *testing.T) {
	setupTestGateway(t)

	tests := []struct {
		name               string
		url                string
		expectedStatusCode int
		expectedResponseId float64
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
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			res, err := http.Get(test.url)
			assert.NoError(t, err)
			assert.Equal(t, test.expectedStatusCode, res.StatusCode)

			// https://jsonplaceholder.typicode.com/todos/:id
			body, err := io.ReadAll(res.Body)
			assert.NoError(t, err)

			var responseBody map[string]interface{}
			err = json.Unmarshal(body, &responseBody)
			assert.NoError(t, err)
			assert.Equal(t, test.expectedResponseId, responseBody["id"])
		})
	}
}
