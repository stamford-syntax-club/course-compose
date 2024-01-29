FROM golang:alpine as build-base

WORKDIR /review-api

# Prisma
COPY ./packages/prisma/schema.prisma .
COPY ./packages/prisma/.env.docker .env

COPY ./apps/reviews-api/go.mod ./apps/reviews-api/go.sum ./
COPY ./apps/reviews-api ./

# Generate Prisma Client
RUN PRISMA_PROVIDER='go run github.com/steebchen/prisma-client-go' PRISMA_OUTPUT='./review/data/datasource/db' go run github.com/steebchen/prisma-client-go generate --schema=./schema.prisma
 

# Build Reviews API
RUN go mod download && CGO_ENABLED=0 GOOS=linux go build -o ./out/reviews-api main.go

# Optimize Image Size
FROM alpine:3.16.2

WORKDIR /app

ARG ENVIRONMENT
ENV ENVIRONMENT=$ENVIRONMENT

COPY --from=build-base /review-api/out/reviews-api ./
COPY --from=build-base /review-api/go.mod ./
# go.mod is needed for determining the root dir

EXPOSE 8003

CMD ["sh", "-c", "./reviews-api -environment=$ENVIRONMENT"]
