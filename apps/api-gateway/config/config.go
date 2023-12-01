package config

import (
	"errors"
	"fmt"
	"os"

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

func ReadGatewayConfig() (*Gateway, error) {
	data, err := os.ReadFile("syntax-config.yaml")
	if err != nil {
		return nil, errors.New(fmt.Sprintf("read syntax-config.yaml: %v", err))
	}

	var gatewayConf *Gateway
	if err := yaml.Unmarshal(data, &gatewayConf); err != nil {
		return nil, errors.New(fmt.Sprintf("unmarshal syntax-config.yaml: %v", err))
	}

	return gatewayConf, nil
}
