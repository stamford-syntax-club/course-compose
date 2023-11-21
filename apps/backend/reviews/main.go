package main

import (
	"fmt"
	"log"

	"github.com/joho/godotenv"
	"github.com/stamford-syntax-club/course-compose/reviews/data"
	"github.com/stamford-syntax-club/course-compose/reviews/routers"
)

func main() {
	fmt.Println("Hello, World!")

    godotenv.Load(".env.development")
    data.NewPrismaClient()

	fr := routers.NewFiberRouter(":8000")
	if err := fr.ListenAndServe(); err != nil {
		log.Panicf("fiber router: %v", err)
	}
}
