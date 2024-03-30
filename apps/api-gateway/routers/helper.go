package routers

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/stamford-syntax-club/course-compose/api-gateway/config"
)

func sendHTTPRequest(c *fiber.Ctx, method, endpoint string) (int, []byte, error) {
	req, err := http.NewRequest(method, endpoint, bytes.NewBuffer(c.Body()))
	if err != nil {
		return 0, nil, errors.New(fmt.Sprintf("http new request: %v", err))
	}
	headers := c.GetReqHeaders()
	req.Header.Set("Content-Type", string(c.Request().Header.ContentType()))

	if len(headers["Authorization"]) > 0 {
		req.Header.Set("Authorization", headers["Authorization"][0])
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return 0, nil, errors.New(fmt.Sprintf("forward http request: %v", err))
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return 0, nil, errors.New(fmt.Sprintf("read response body: %v", err))
	}

	return resp.StatusCode, respBody, nil
}

func parseResponse(route config.Route, respBody []byte) (interface{}, error) {
	var resp interface{}
	if route.Dest.IsArray {
		resp = []map[string]interface{}{}
	} else {
		resp = map[string]interface{}{}
	}

	if err := json.Unmarshal(respBody, &resp); err != nil {
		return nil, err
	}

	return resp, nil
}

func appendQueryParams(queries map[string]string, endpoint *string) {
	if len(queries) >= 1 {
		*endpoint += "?"
	}

	for key, value := range queries {
		*endpoint += fmt.Sprintf("%s=%s&", key, value)
	}
}

func createHandler(route config.Route) fiber.Handler {
	return func(c *fiber.Ctx) error {
		endpoint := route.Dest.Endpoint
		params := c.Route().Params

		for _, p := range params {
			endpoint = strings.ReplaceAll(endpoint, ":"+p, c.Params(p))
		}

		appendQueryParams(c.Queries(), &endpoint)

		log.Printf("Forwarding request to service: %s - %s", route.Dest.Service, endpoint)
		respCode, respBody, err := sendHTTPRequest(c, route.Method, endpoint)
		if err != nil {
			log.Printf("sendHTTPRequest: %v", err)
			return fiber.NewError(http.StatusBadGateway, "Cannot reach specified service")
		}

		if len(respBody) == 0 {
			return c.SendStatus(respCode)
		}

		resp, err := parseResponse(route, respBody)
		if err != nil {
			log.Printf("parseResponse: %v", err)
			return errors.New("Internal Server Error Please See System Logs for more Information")
		}

		return c.Status(respCode).JSON(resp)
	}
}
