package db

import "log"

func New() *PrismaClient {
	prisma := NewClient()
	if err := prisma.Prisma.Connect(); err != nil {
		log.Fatalln("Prisma connect: ", err)
	}

	return prisma
}
