package review_controller

import (
	"context"
	"net/http"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/stamford-syntax-club/course-compose/reviews/common/utils"
	"github.com/stamford-syntax-club/course-compose/reviews/review/data/datasource/db"
	"github.com/stamford-syntax-club/course-compose/reviews/review/domain/dto"
	review_repo "github.com/stamford-syntax-club/course-compose/reviews/review/domain/repository"
)

type ReviewController struct {
	reviewRepo review_repo.ReviewRepository
}

func NewReviewController(reviewRepo review_repo.ReviewRepository) *ReviewController {
	return &ReviewController{
		reviewRepo: reviewRepo,
	}
}

func (rc *ReviewController) GetReviews(c *fiber.Ctx) error {
	courseCode := c.Params("courseCode")
	pageSize := c.QueryInt("pageSize", 2)
	pageNumber := c.QueryInt("pageNumber", 1)

	ctx, cancelFunc := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancelFunc()

	userID := utils.GetUserID(c)

	pageInformation := &utils.PageInformation{
		Size:   pageSize,
		Number: pageNumber,
	}

	rawReviews, count, err := rc.reviewRepo.GetCourseReviews(ctx, courseCode, userID, pageInformation)
	if err != nil {
		return err
	}

	reviews := dto.MapReviewToReviewDTO(rawReviews, userID)

	result := utils.NewPagination(reviews, count, pageInformation)

	return c.Status(http.StatusOK).JSON(result)
}

func (rc *ReviewController) SubmitReview(c *fiber.Ctx) error {
	review := db.ReviewModel{}
	if err := c.BodyParser(&review); err != nil || review.Description == "" || review.AcademicYear == 0 {
		return fiber.NewError(http.StatusBadRequest, "Invalid request body")
	}

	courseCode := c.Params("courseCode")
	if courseCode == "" {
		return fiber.NewError(http.StatusBadRequest, "Invalid course code")
	}

	userID := utils.GetUserID(c)
	if userID == "" {
		return fiber.NewError(http.StatusBadRequest, "Invalid user ID")
	}

	ctx, cancelFunc := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancelFunc()
	if err := rc.reviewRepo.SubmitReview(ctx, &review, courseCode, userID); err != nil {
		return err
	}

	// if err := data.SubmitReview(ctx, h.prisma, h.reviewPlacer, courseCode, &review, userID); err != nil {
	// 	return err
	// }

	return c.Status(http.StatusCreated).JSON("Success")
}

//	con, err := kafka.NewConsumer(&kafka.ConfigMap{
//		"bootstrap.servers": "localhost:9092",
//		"group.id":          "glloooo",
//		"auto.offset.reset": "earliest",
//	})
//	if err != nil {
//		log.Fatal("Consumer: ", err)
//	}
//
//	go func() {
//		// Use this to read all items inside the topic (like when an API is called :3)
//		if err := con.Assign([]kafka.TopicPartition{topic}); err != nil {
//			log.Fatal(err)
//		}
//
//		for {
//			msg, err := con.ReadMessage(-1)
//			if err != nil {
//				if err.(kafka.Error).Code() == kafka.ErrTimedOut {
//					log.Println("Time out waiting for new event")
//				} else {
//					log.Println("Error while readng event: ", err)
//				}
//				break
//			}
//
//			fmt.Printf("Received: %s\n", string(msg.Value))
//		}
//		con.Close()
//	}()
//
