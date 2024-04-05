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

type ReviewProducer struct {
	producer *kafka.Conn
	reader   *kafka.Reader
}

func NewReviewProducer(topic string, brokerURL string) (*ReviewProducer, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	conn, err := kafka.DialLeader(ctx, "tcp", brokerURL, topic, 0)
	if err != nil {
		return nil, err
	}

	if exist := topicExist(conn, topic); !exist {
		conn.CreateTopics(kafka.TopicConfig{
			Topic:             topic,
			NumPartitions:     1,
			ReplicationFactor: 1,
		})
	}

	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers:  []string{brokerURL},
		GroupID:  "review-reader",
		Topic:    topic,
		MaxBytes: 10e6, // 10MB
	})

	return &ReviewProducer{producer: conn, reader: reader}, nil
}

func (r *ReviewProducer) Produce(review dto.ReviewDTO) error {
	data, err := json.Marshal(review)
	if err != nil {
		log.Printf("could not marshal review: %+v\n because of %v", review, err)
		return fiber.ErrInternalServerError
	}

	_, err = r.producer.WriteMessages([]kafka.Message{{Value: data}}...)
	if err != nil {
		log.Printf("could not write review %+v\n to kafka because of %v", review, err)
		return fiber.ErrInternalServerError
	}

	log.Println("successfully produce to kafka")
	return nil
}

func (r *ReviewProducer) ReportDeliveryStatus() {
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)

	for {
		select {
		case <-c:
			log.Println("Stopping Kafka delivery report channel...")
			if err := r.producer.Close(); err != nil {
				log.Fatalln("failed to close kafka producer: ", err)
			}
			if err := r.reader.Close(); err != nil {
				log.Fatalln("failed to close kafka reader: ", err)
			}
			return
		default:
			message, err := r.reader.ReadMessage(context.Background())
			if err != nil {
				log.Println("failed to get message: ", err)
			}
			log.Printf("Successfully produced record to topic %s partition [%d] @ offset %v\n",
				message.Topic, message.Partition, message.Offset)
			log.Println("Value is: ", string(message.Value))
		}
	}
}
