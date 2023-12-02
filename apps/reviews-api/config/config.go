package config

import (
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
)

// findRootDir looks for a marker file (e.g., go.mod) in the current directory
// and all parent directories until it reaches the root directory.
// In our case, the root directory is /reviews
func findRootDir() (string, error) {
	// Start from the current working directory
	currentDir, err := os.Getwd()
	if err != nil {
		return "", fmt.Errorf("Error getting working directory: %v", err)
	}

	// Look for a marker file (e.g., go.mod)
	if _, err := os.Stat(filepath.Join(currentDir, "go.mod")); err == nil {
		return currentDir, nil
	}

	// Move up one directory
	currentDir = filepath.Dir(currentDir)

	return "", fmt.Errorf("Marker file not found, please make sure you are inside the project directory")
}

func LoadEnvFile(appEnv string) error {
	dir, err := findRootDir()
	if err != nil {
		log.Fatal(err)
	}

	// Load the .env file in the specified directory
	envPath := filepath.Join(dir, ".env."+appEnv)
	if err := godotenv.Load(envPath); err != nil {
		return errors.New(fmt.Sprintf("godotenv: %v", err))
	}

	log.Println("loaded env file: ", envPath)
	return nil
}
