package utils

//import (
//	"log"
//
//	"github.com/confluentinc/confluent-kafka-go/kafka"
//)
//
//func InitReviewKafka() (*kafka.Producer, kafka.TopicPartition, chan kafka.Event) {
//	p, err := kafka.NewProducer(&kafka.ConfigMap{
//		"bootstrap.servers": "localhost:9092",
//		"client.id":         "khing",
//		"acks":              "all",
//	})
//	if err != nil {
//		log.Fatal("Creating Producer: ", err)
//	}
//
//	topic := "Hello"
//	topicPartition := kafka.TopicPartition{
//		Topic: &topic,
//	}
//	deliveryCh := make(chan kafka.Event, 10000)
//
//	go ReportDeliveryStatus(deliveryCh)
//
//	return p, topicPartition, deliveryCh
//}
//
//func ReportDeliveryStatus(deliveryCh chan kafka.Event) {
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
