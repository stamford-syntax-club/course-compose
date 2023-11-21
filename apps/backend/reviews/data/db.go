package data

import (
	"errors"
	"fmt"

	"github.com/stamford-syntax-club/course-compose/prisma/db"
)

var client *db.PrismaClient

func NewPrismaClient() error {
	client = db.NewClient()

	if err := client.Prisma.Connect(); err != nil {
		return errors.New(fmt.Sprintf("Prisma Connect: %v", err))
	}
	return nil
}
