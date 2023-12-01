FROM golang:alpine as build-base

WORKDIR /review-app

# Generate Prisma
RUN mkdir -p ../prisma
COPY ./packages/prisma/schema.prisma ../prisma/
COPY ./packages/prisma/.env.docker ../prisma/.env
COPY ./apps/prisma/go.mod ./apps/prisma/go.sum ../prisma/
RUN cd ../prisma && go run github.com/steebchen/prisma-client-go generate

# Build Reviews API
COPY ./apps/reviews-api/go.mod ./apps/reviews-api/go.sum ./
COPY ./apps/reviews-api ./
RUN go mod download && CGO_ENABLED=0 GOOS=linux go build -o ./out/reviews-api ./cmd

# Optimize Image Size
FROM alpine:3.16.2

WORKDIR /app

ARG ENVIRONMENT
ENV ENVIRONMENT=$ENVIRONMENT

COPY --from=build-base /review-app/out/reviews-api ./
COPY --from=build-base /review-app/go.mod ./
# go.mod is needed for determining the root dir

EXPOSE 8003

CMD ["sh", "-c", "./reviews-api -environment=$ENVIRONMENT"]
