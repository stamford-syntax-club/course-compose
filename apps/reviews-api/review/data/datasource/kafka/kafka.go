package kafka

//import (
//	"encoding/json"
//	"log"
//
//	"github.com/confluentinc/confluent-kafka-go/kafka"
//	"github.com/gofiber/fiber/v2"
//	"github.com/stamford-syntax-club/course-compose/reviews/review/data/datasource/db"
//)
//
//type ReviewProducer struct {
//	Producer       *kafka.Producer
//	TopicPartition kafka.TopicPartition
//	DeliveryCh     chan kafka.Event
//}
//
//func (r *ReviewProducer) produceToKafka(review *db.ReviewModel) error {
//	data, err := json.Marshal(review)
//	if err != nil {
//		log.Println("could not marshal review: ", err)
//		return fiber.ErrInternalServerError
//	}
//
//	err = r.Producer.Produce(&kafka.Message{
//		TopicPartition: r.TopicPartition, Value: data}, r.DeliveryCh)
//	if err != nil {
//		log.Println("could not produce review: ", err)
//		return fiber.ErrInternalServerError
//	}
//
//	return nil
//}
//
//func reportDeliveryStatus(deliveryCh chan kafka.Event) {
//	for e := range deliveryCh {
//		switch ev := e.(type) {
//		case *kafka.Message:
//			if ev.TopicPartition.Error != nil {
//				log.Println("Failed to deliver message: ", ev.TopicPartition)
//				continue
//			}
//			log.Printf("Successfully produced record to topic %s partition [%d] @ offset %v\n",
//				*ev.TopicPartition.Topic, ev.TopicPartition.Partition, ev.TopicPartition.Offset)
//
//			log.Println("Value is: ", string(ev.Value))
//		}
//	}
//}
