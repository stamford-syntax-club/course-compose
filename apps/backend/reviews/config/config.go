package config

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
)

func LoadEnvFile() error {
    // we include directory name because our Makefile is outside of the reviews directory
	envFile := filepath.Join("reviews", ".env."+os.Getenv("ENVIRONMENT"))

	if err := godotenv.Load(envFile); err != nil {
		return errors.New(fmt.Sprintf("godotenv: %v", err))
	}

	return nil
}
