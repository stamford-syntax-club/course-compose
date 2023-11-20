module github.com/stamford-syntax-club/course-compose/courses-api

go 1.21.2

replace github.com/stamford-syntax-club/course-compose/prisma => ../prisma

require github.com/stamford-syntax-club/course-compose/prisma v0.0.0-00010101000000-000000000000

require (
	github.com/iancoleman/strcase v0.3.0 // indirect
	github.com/joho/godotenv v1.5.1 // indirect
	github.com/shopspring/decimal v1.3.1 // indirect
	github.com/steebchen/prisma-client-go v0.28.0 // indirect
	github.com/takuoki/gocase v1.1.1 // indirect
	golang.org/x/text v0.14.0 // indirect
)
