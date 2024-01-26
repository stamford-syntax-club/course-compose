package kafka

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/gofiber/fiber/v2"
	"github.com/stamford-syntax-club/course-compose/reviews/common/utils"
	"github.com/stamford-syntax-club/course-compose/reviews/review/data/datasource/db"
)

type ReviewMessage struct {
	AcademicYear string
}

type ReviewProducer struct {
	Producer       *kafka.Producer
	TopicPartition kafka.TopicPartition
	DeliveryCh     chan kafka.Event
}

func TESTTTTTT(tp kafka.TopicPartition) {
	c, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers": "localhost:9092",
		"group.id":          "glloooo",
		"auto.offset.reset": "earliest",
	})
	if err != nil {
		log.Fatal("Consumer: ", err)
	}

	if err := c.Assign([]kafka.TopicPartition{tp}); err != nil {
		log.Fatal(err)
	}

	for {
		msg, err := c.ReadMessage(-1)
		if err != nil {
			if err.(kafka.Error).Code() == kafka.ErrTimedOut {
				log.Println("Time out waiting for new event")
			} else {
				log.Println("Error while readng event: ", err)
			}
			break
		}

		var review db.ReviewModel
		if err := json.Unmarshal(msg.Value, &review); err != nil {
			log.Println(err)
		}

		// Simulate like --- FOUND MY REVIEW ID!!!
		//		if review.Description == "28th Jan" {
		//			fmt.Println("FOUND IT")
		//		}
		fmt.Printf("Received: %+v\n", review)

	}
}

func NewReviewProducer(topic, clientID string, brokersURL ...string) (*ReviewProducer, error) {
	brokers := utils.FormatBrokerServers(brokersURL...)
	p, err := kafka.NewProducer(&kafka.ConfigMap{
		"bootstrap.servers": brokers,
		"client.id":         clientID,
		"acks":              "all",
	})
	if err != nil {
		return nil, err
	}

	tp := kafka.TopicPartition{
		Topic: &topic,
	}

	deliveryCh := make(chan kafka.Event, 10000)

	return &ReviewProducer{
		Producer:       p,
		TopicPartition: tp,
		DeliveryCh:     deliveryCh,
	}, nil
}

func (r *ReviewProducer) Produce(review *db.ReviewModel) error {
	data, err := json.Marshal(review)
	if err != nil {
		log.Println("could not marshal review: ", err)
		return fiber.ErrInternalServerError
	}

	err = r.Producer.Produce(&kafka.Message{
		TopicPartition: r.TopicPartition, Value: data}, r.DeliveryCh)
	if err != nil {
		log.Println("could not produce review: ", err)
		return fiber.ErrInternalServerError
	}

	return nil
}

// this hsould be in main??
func reportDeliveryStatus(deliveryCh chan kafka.Event) {
	for e := range deliveryCh {
		switch ev := e.(type) {
		case *kafka.Message:
			if ev.TopicPartition.Error != nil {
				log.Println("Failed to deliver message: ", ev.TopicPartition)
				continue
			}
			log.Printf("Successfully produced record to topic %s partition [%d] @ offset %v\n",
				*ev.TopicPartition.Topic, ev.TopicPartition.Partition, ev.TopicPartition.Offset)

			log.Println("Value is: ", string(ev.Value))
		}
	}
}
