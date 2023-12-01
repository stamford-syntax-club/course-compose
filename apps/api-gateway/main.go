package main

import (
	"log"

	"github.com/stamford-syntax-club/course-compose/api-gateway/config"
	"github.com/stamford-syntax-club/course-compose/api-gateway/routers"
)

func main() {
	gatewayConfig, err := config.ReadGatewayConfig("syntax-config.yaml")
	if err != nil {
		log.Fatal("Read gateway config: ", err)
	}

	fiberRouter := routers.NewFiberRouter(":8000", gatewayConfig.Routes)
	fiberRouter.ListenAndServe()
}
