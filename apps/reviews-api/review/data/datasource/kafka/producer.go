package kafka

import (
	"encoding/json"
	"log"
	"os"
	"os/signal"

	"github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/gofiber/fiber/v2"
	"github.com/stamford-syntax-club/course-compose/reviews/common/utils"
	"github.com/stamford-syntax-club/course-compose/reviews/review/data/datasource/db"
)

type ReviewProducer struct {
	Producer       *kafka.Producer
	TopicPartition kafka.TopicPartition
	DeliveryCh     chan kafka.Event
}

func NewReviewProducer(topic, clientID string, brokersURL ...string) (*ReviewProducer, error) {
	brokers := utils.FormatBrokerServers(brokersURL...)
	p, err := kafka.NewProducer(&kafka.ConfigMap{
		"bootstrap.servers": brokers,
		"client.id":         clientID,
		"acks":              "all", // consider the msg as sent when all replicas have acknowledged the msg
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

func (r *ReviewProducer) ReportDeliveryStatus() {
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	for {
		select {
		case <-c:
			log.Println("Stopping Kafka delivery report channel...")
			close(r.DeliveryCh)
			return
		case e, ok := <-r.DeliveryCh:
			if !ok {
				return
			}

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
}
