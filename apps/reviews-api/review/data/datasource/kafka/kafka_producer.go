package kafka

import (
	"encoding/json"
	"log"
	"os"
	"os/signal"

	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
	"github.com/gofiber/fiber/v2"
	"github.com/stamford-syntax-club/course-compose/reviews/review/domain/dto"
)

type ReviewProducer struct {
	Producer       *kafka.Producer
	TopicPartition kafka.TopicPartition
	DeliveryCh     chan kafka.Event
}

func formatBrokerServers(brokersURL ...string) (brokers string) {
	for i, url := range brokersURL {
		brokers += url
		if i < len(brokersURL)-1 {
			brokers += ","
		}
	}
	return
}

func NewReviewProducer(topic, clientID string, brokersURL ...string) (*ReviewProducer, error) {
	brokers := formatBrokerServers(brokersURL...)
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

func (r *ReviewProducer) Produce(review dto.ReviewDTO) error {
	data, err := json.Marshal(review)
	if err != nil {
		log.Printf("could not marshal review: %+v\n because of %v", review, err)
		return fiber.ErrInternalServerError
	}

	err = r.Producer.Produce(&kafka.Message{
		TopicPartition: r.TopicPartition, Value: data}, r.DeliveryCh)
	if err != nil {
		log.Printf("could not produce review: %+v\n because of %v", review, err)
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
