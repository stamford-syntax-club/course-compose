package main

import (
	"flag"
	"log"

	"github.com/stamford-syntax-club/course-compose/prisma/db"
	"github.com/stamford-syntax-club/course-compose/reviews/config"
	"github.com/stamford-syntax-club/course-compose/reviews/handlers"
	"github.com/stamford-syntax-club/course-compose/reviews/routers"
)

var environment string

func init() {
	flag.StringVar(&environment, "environment", "development", "Specify the environment (e.g., development, production)")
	flag.Parse()
}

func main() {
	if err := config.LoadEnvFile(environment); err != nil {
        log.Fatalf("load env file: %v", err)
	}

	client := db.NewClient()
	if err := client.Prisma.Connect(); err != nil {
		log.Fatalf("Prisma Connect: %v", err)
	}

	h := handlers.New(client)

	r := routers.NewFiberRouter(":8000", h)
	if err := r.ListenAndServe(); err != nil {
		log.Fatalf("fiber router: %v", err)
	}
}
