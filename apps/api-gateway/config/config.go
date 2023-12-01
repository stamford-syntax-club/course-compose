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

func ReadGatewayConfig(filename string) (*Gateway, error) {
	data, err := os.ReadFile(filename)
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
