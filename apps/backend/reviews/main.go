package main

import (
	"log"

	"github.com/stamford-syntax-club/course-compose/reviews/config"
	"github.com/stamford-syntax-club/course-compose/reviews/data"
	"github.com/stamford-syntax-club/course-compose/reviews/routers"
)

func main() {
	config.LoadEnvFile()

	data.NewPrismaClient()

	fr := routers.NewFiberRouter(":8000")
	if err := fr.ListenAndServe(); err != nil {
		log.Fatalf("fiber router: %v", err)
	}
}
