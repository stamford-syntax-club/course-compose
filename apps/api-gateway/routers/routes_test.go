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
