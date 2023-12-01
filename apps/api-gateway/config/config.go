package config

import (
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"gopkg.in/yaml.v3"
)

type Gateway struct {
	Routes []Route `yaml:"routes"`
}

type Route struct {
	Path   string      `yaml:"path"`
	Method string      `yaml:"method"`
	Dest   Destination `yaml:"destination"`
}

type Destination struct {
	Service  string `yaml:"service"`
	Endpoint string `yaml:"endpoint"`
	IsArray  bool   `yaml:"is_array"`
}

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

func ReadGatewayConfig(filename string) (*Gateway, error) {
	dir, err := findRootDir()
	if err != nil {
		return nil, errors.New(fmt.Sprintf("find root dir: %v", err))
	}

	fullpath := filepath.Join(dir, filename)

	data, err := os.ReadFile(fullpath)
	if err != nil {
		return nil, errors.New(fmt.Sprintf("read syntax-config.yaml: %v", err))
	}

	var gatewayConf *Gateway
	if err := yaml.Unmarshal(data, &gatewayConf); err != nil {
		return nil, errors.New(fmt.Sprintf("unmarshal syntax-config.yaml: %v", err))
	}

	if err := validateGatewayConfig(gatewayConf); err != nil {
		return nil, err
	}

	log.Println("loaded config file: ", fullpath)
	return gatewayConf, nil
}

func validateGatewayConfig(gatewayConf *Gateway) error {
	if len(gatewayConf.Routes) <= 0 {
		return errors.New("no routes found in syntax-config.yaml")
	}

	for _, route := range gatewayConf.Routes {
		if route.Path == "" {
			return errors.New("route path cannot be empty")
		}

		if route.Method == "" {
			return errors.New("route method cannot be empty")
		}

		if route.Dest.Endpoint == "" {
			return errors.New("route destination endpoint cannot be empty")
		}

		// no need to check for route.Dest.Service because it is only used for logging
	}
	return nil
}
