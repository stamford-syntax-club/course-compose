package data

import (
	"errors"
	"fmt"

	"github.com/stamford-syntax-club/course-compose/prisma/db"
)

var Client *db.PrismaClient

func NewPrismaClient() error {
	Client = db.NewClient()

	if err := Client.Prisma.Connect(); err != nil {
		return errors.New(fmt.Sprintf("Prisma Connect: %v", err))
	}
	return nil
}
