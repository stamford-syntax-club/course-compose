package routers

import (
	"log"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/stamford-syntax-club/course-compose/api-gateway/config"
)

func registerRoutes(app *fiber.App, routes []config.Route) *fiber.App {
	for _, route := range routes {
		handler := createHandler(route)
		switch route.Method {
		case http.MethodGet:
			app.Get(route.Path, handler)
		case http.MethodPost:
			app.Post(route.Path, handler)
		default:
			log.Printf("Unsupported HTTP method: %s for path: %s\n", route.Method, route.Path)
		}
	}

	return app
}
