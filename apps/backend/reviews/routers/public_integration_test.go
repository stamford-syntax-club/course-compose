package routers

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/ory/dockertest/v3"
	"github.com/ory/dockertest/v3/docker"
	"github.com/stamford-syntax-club/course-compose/prisma/db"
	"github.com/stamford-syntax-club/course-compose/reviews/data"
	"github.com/steebchen/prisma-client-go/cli"
	"github.com/stretchr/testify/assert"
)

func setup(t *testing.T) (*dockertest.Pool, *dockertest.Resource) {
	pool, err := dockertest.NewPool("")
	if err != nil {
		t.Fatalf("Could not construct pool: %s", err)
	}

	if err := pool.Client.Ping(); err != nil {
		t.Fatalf("Could not ping docker: %s", err)
	}

	postgres, err := pool.RunWithOptions(&dockertest.RunOptions{
		Repository: "postgres",
		Tag:        "15",
		Env: []string{
			"POSTGRES_USER=myuser",
			"POSTGRES_PASSWORD=mypassword",
			"POSTGRES_DB=test",
		},
		ExposedPorts: []string{"5432/tcp"},
	}, func(config *docker.HostConfig) {
		config.AutoRemove = true
		config.RestartPolicy = docker.RestartPolicy{
			Name: "no",
		}
	})
	if err != nil {
		t.Fatalf("Could not start resource: %s", err)
	}
	postgres.Expire(60)

	// wait for db to start
	time.Sleep(time.Second)

	datasource := fmt.Sprintf("postgres://myuser:mypassword@localhost:%s/test", postgres.GetPort("5432/tcp"))
	os.Setenv("DATABASE_URL", datasource)

	data.Client = db.NewClient()

	if err := data.Client.Prisma.Connect(); err != nil {
		t.Fatalf("Could not connect to database: %s", err)
	}

	if err := cli.Run([]string{"db", "push", "--schema=../../../../packages/prisma/schema.prisma"}, true); err != nil {
		t.Fatalf("Could not sync database: %s", err)
	}

	seed()

	return pool, postgres
}

func seed() {
	_, err := data.Client.User.CreateOne(

		db.User.Username.Set("Test"),
		db.User.Email.Set("Test@gmail.com"),
		db.User.Verified.Set(true),
	).Exec(context.Background())

	if err != nil {
		panic(err)
	}

	_, err = data.Client.Course.CreateOne(
		db.Course.Code.Set("ITE101"),
		db.Course.FullName.Set("Introduction to Information Technology"),
		db.Course.Prerequisites.Set([]string{}),
	).Exec(context.Background())

	if err != nil {
		panic(err)
	}

	_, err = data.Client.Review.CreateOne(
		db.Review.AcademicYear.Set(2021),
		db.Review.Description.Set("Test Review"),
		db.Review.Rating.Set(5),
		db.Review.Votes.Set(0),
		db.Review.Status.Set("PENDING"),
		db.Review.Course.Link(db.Course.ID.Equals(1)),
		db.Review.User.Link(db.User.ID.Equals(1)),
	).Exec(context.Background())

	if err != nil {
		panic(err)
	}
}
func TestGetAllReviews(t *testing.T) {
	pool, postgres := setup(t)
	defer func() {
		if err := pool.Purge(postgres); err != nil {
			t.Fatalf("Could not purge container: %s", err)
		}

		data.Client.Prisma.Disconnect()
	}()

	app := fiber.New()
	api := app.Group("/api")
	registerPublicRoutes(api)

	req := httptest.NewRequest(http.MethodGet, "/api/ITE101/reviews", http.NoBody)
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req, -1)

	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)
}
