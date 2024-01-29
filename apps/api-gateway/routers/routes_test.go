package routers

import (
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stamford-syntax-club/course-compose/api-gateway/config"
	"github.com/stretchr/testify/assert"
)

func TestRegisterRoute(t *testing.T) {
	t.Run("should register routes with supported methods", func(t *testing.T) {
		app := fiber.New()
		routes := []config.Route{
			{
				Path:   "/test",
				Method: "GET",
				Dest: config.Destination{
					Service:  "test",
					Endpoint: "/test",
				},
			},
			{
				Path:   "/test2",
				Method: "GET",
				Dest: config.Destination{
					Service:  "test2",
					Endpoint: "/test2",
				},
			},
		}

		app = registerRoutes(app, routes)

		assert.True(t, len(app.GetRoutes()) > 0)
	})

	t.Run("should not register routes with unsupported methods", func(t *testing.T) {
		app := fiber.New()
		routes := []config.Route{
			{
				Path:   "/test",
				Method: "PATCH",
				Dest: config.Destination{
					Service:  "test",
					Endpoint: "/test",
				},
			},
			{
				Path:   "/test2",
				Method: "HELLO",
				Dest: config.Destination{
					Service:  "test2",
					Endpoint: "/test2",
				},
			},
		}

		app = registerRoutes(app, routes)

		assert.Equal(t, 0, len(app.GetRoutes()))
	})
}

func TestAppendQueryParams(t *testing.T) {
	tests := []struct {
		name             string
		queries          map[string]string
		expectedEndpoint string
	}{
		{
			name:             "should do nothign if no params",
			queries:          map[string]string{},
			expectedEndpoint: "http://test-endpoint.com",
		},
		{
			name: "should append single param",
			queries: map[string]string{
				"userId": "9",
			},
			expectedEndpoint: "http://test-endpoint.com?userId=9&",
		},
		{
			name: "should append multiple params",
			queries: map[string]string{
				"userId": "9",
				"hello":  "world",
				"foo":    "bar",
			},
			expectedEndpoint: "http://test-endpoint.com?userId=9&hello=world&foo=bar&",
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			endpoint := "http://test-endpoint.com"

			appendQueryParams(test.queries, &endpoint)

			assert.Equal(t, test.expectedEndpoint, endpoint)
		})
	}
}
