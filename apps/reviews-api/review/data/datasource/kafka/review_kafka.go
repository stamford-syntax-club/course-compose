package kafka

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"os/signal"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/segmentio/kafka-go"
	"github.com/stamford-syntax-club/course-compose/reviews/review/domain/dto"
)

func topicExist(conn *kafka.Conn, topic string) bool {
	partitions, err := conn.ReadPartitions()
	if err != nil {
		log.Fatalf("read kafka partitions: %v", err)
		return false
	}

	for _, p := range partitions {
		if p.Topic == topic {
			return true
		}
	}

	return false
}

type ReviewKafka struct {
	brokerURL string
	topic     string
	reporter  *kafka.Reader // prove that message has been sent to topic successfully
}

func NewReviewKafka(topic string, brokerURL string) (*ReviewKafka, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	conn, err := kafka.DialLeader(ctx, "tcp", brokerURL, topic, 0)
	if err != nil {
		return nil, err
	}

	if exist := topicExist(conn, topic); !exist {
		err := conn.CreateTopics(kafka.TopicConfig{
			Topic:             topic,
			NumPartitions:     1,
			ReplicationFactor: 1,
		})
		if err != nil {
			return nil, err
		}
	}

	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers:  []string{brokerURL},
		GroupID:  "review-reader",
		Topic:    topic,
		MaxBytes: 10e6, // 10MB
	})

	return &ReviewKafka{brokerURL: brokerURL, topic: topic, reporter: reader}, nil
}

func (r *ReviewKafka) Produce(review dto.ReviewDTO) error {
	data, err := json.Marshal(review)
	if err != nil {
		log.Printf("could not marshal review: %+v\n because of %v", review, err)
		return fiber.ErrInternalServerError
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	conn, err := kafka.DialLeader(ctx, "tcp", r.brokerURL, r.topic, 0)
	defer func() {
		cancel()
		if err := conn.Close(); err != nil {
			log.Fatalln("failed to close kafka producer: ", err)
		}
	}()
	if err != nil {
		return err
	}

	_, err = conn.WriteMessages([]kafka.Message{{Value: data}}...)
	if err != nil {
		log.Printf("could not write review %+v\n to kafka because of %v", review, err)
		return fiber.ErrInternalServerError
	}

	log.Println("successfully produce to kafka")
	return nil
}

func (r *ReviewKafka) ReportDeliveryStatus() {
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)

	for {
		select {
		case <-c:
			log.Println("Stopping Kafka delivery report channel...")
			if err := r.reporter.Close(); err != nil {
				log.Fatalln("failed to close kafka reader: ", err)
			}
			return
		default:
			message, err := r.reporter.ReadMessage(context.Background())
			if err != nil {
				log.Println("failed to get message: ", err)
			}
			log.Printf("Successfully produced record to topic %s partition [%d] @ offset %v\n",
				message.Topic, message.Partition, message.Offset)
			log.Println("Value is: ", string(message.Value))
		}
	}
}
