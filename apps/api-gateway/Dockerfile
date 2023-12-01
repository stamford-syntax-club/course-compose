FROM golang:alpine as build-base

WORKDIR /app

COPY ./apps/api-gateway/go.mod .

RUN go mod download

COPY ./apps/api-gateway/ .

RUN go build -o ./out/api-gateway .

FROM alpine:3.16.2

WORKDIR /app

COPY --from=build-base /app/out/api-gateway ./
COPY --from=build-base /app/go.mod ./
# go mod is needed for determining the root dir

EXPOSE 8000

CMD ["/app/api-gateway"]
