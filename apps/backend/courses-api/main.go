package main

import (
	"fmt"
	"github.com/stamford-syntax-club/course-compose/prisma-go/db"
)

func main() {
	fmt.Println("Hello, World!")

	client := db.NewClient()
	client.Prisma.Connect()
}
