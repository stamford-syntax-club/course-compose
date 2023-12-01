package main

import (
	"flag"
	"log"

	"github.com/stamford-syntax-club/course-compose/api-gateway/config"
	"github.com/stamford-syntax-club/course-compose/api-gateway/routers"
)

var configFile string

func init() {
	flag.StringVar(&configFile, "config", "syntax-config.yaml", "path to config file")
	flag.Parse()
}

func main() {
	gatewayConfig, err := config.ReadGatewayConfig(configFile)
	if err != nil {
		log.Fatal("Read gateway config: ", err)
	}

	fiberRouter := routers.NewFiberRouter(":8000", gatewayConfig.Routes)
	fiberRouter.ListenAndServe()
}
