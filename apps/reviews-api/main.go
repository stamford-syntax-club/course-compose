package main

import (
	"flag"
	"log"
	"time"

	"github.com/stamford-syntax-club/course-compose/reviews/common/config"
	"github.com/stamford-syntax-club/course-compose/reviews/common/presentation/router"
	"github.com/stamford-syntax-club/course-compose/reviews/common/utils"
	review_db "github.com/stamford-syntax-club/course-compose/reviews/review/data/datasource/db"
	review_repo_impl "github.com/stamford-syntax-club/course-compose/reviews/review/data/repository"
	review_controller "github.com/stamford-syntax-club/course-compose/reviews/review/domain/controller"
	review_router "github.com/stamford-syntax-club/course-compose/reviews/review/presentation/router"
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

	reviewDB := review_db.NewClient()
	if err := reviewDB.Prisma.Connect(); err != nil {
		log.Fatalln("Prisma connect: ", err)
	}
	defer reviewDB.Prisma.Disconnect()
	token, err := utils.GenerateNewAccessToken("8a7b3c2e-3e5f-4f1a-a8b7-3c2e1a4f5b6d", "khing@students.stamford.edu", time.Now().Add(time.Hour).Unix())
	if err != nil {
		log.Fatalf("generate new access token: %v", err)
	}
	log.Println(token)
	reviewRepo := review_repo_impl.NewReviewRepositoryImpl(reviewDB)
	reviewController := review_controller.NewReviewController(reviewRepo)

	router := router.NewFiberRouter()

	reviewRouter := review_router.New(router, reviewController)
	reviewRouter.RegisterRoutes()
	if err := router.ListenAndServe(":8003"); err != nil {
		log.Fatalf("fiber router: %v", err)
	}
}
