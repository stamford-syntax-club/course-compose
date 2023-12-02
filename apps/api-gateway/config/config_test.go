package config

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestReadGatewayConfig(t *testing.T) {
	tests := []struct {
		name          string
		configFile    string
		expectedError string
	}{
		{
			name:       "Parse YAML correctly with correct configuration",
			configFile: "testdata/correct.yaml",
		},
		{
			name:          "Return error when no routes are found",
			configFile:    "testdata/no-routes.yaml",
			expectedError: "no routes found in syntax-config.yaml",
		},
		{
			name:          "Return error when route path is empty",
			configFile:    "testdata/route-path-empty.yaml",
			expectedError: "route path cannot be empty",
		},
		{
			name:          "Return error when route method is empty",
			configFile:    "testdata/route-method-empty.yaml",
			expectedError: "route method cannot be empty",
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			_, err := ReadGatewayConfig(test.configFile)

			if test.expectedError != "" {
				assert.Error(t, err)
				assert.Equal(t, test.expectedError, err.Error())
			} else {
				assert.NoError(t, err)
			}
		})
	}
}
