package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/stamford-syntax-club/course-compose/reviews/common/config"
	"github.com/stamford-syntax-club/course-compose/reviews/common/presentation/router"
	"github.com/stamford-syntax-club/course-compose/reviews/common/utils"
	review_db "github.com/stamford-syntax-club/course-compose/reviews/review/data/datasource/db"
	review_kafka "github.com/stamford-syntax-club/course-compose/reviews/review/data/datasource/kafka"
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
	defer func() {
		if err := reviewDB.Prisma.Disconnect(); err != nil {
			log.Fatalln("failed to close postgres connection: ", err)
		}
	}()

	reviewKafka, err := review_kafka.NewReviewKafka(os.Getenv("KAFKA_TOPIC"), os.Getenv("KAFKA_BROKER_URL"))
	if err != nil {
		log.Fatalf("create review producer: %v", err)
	}
	go reviewKafka.ReportDeliveryStatus()

	accessToken, err := utils.GenerateNewAccessToken("8a7b3c2e-3e5f-4f1a-a8b7-3c2e1a4f5b6d", "naris@students.stamford.edu", time.Now().Add(time.Hour*4).Unix())
	if err != nil {
		log.Fatalln("cannot create token: ", err)
	}
	fmt.Println(accessToken)

	reviewRepo := review_repo_impl.NewReviewRepositoryImpl(reviewDB, reviewKafka)
	reviewController := review_controller.NewReviewController(reviewRepo)

	router := router.NewFiberRouter()

	reviewRouter := review_router.New(router, reviewController)
	reviewRouter.RegisterRoutes()
	if err := router.ListenAndServe(":8003"); err != nil {
		log.Fatalf("fiber router: %v", err)
	}
}
