package config

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestReadGatewayConfig(t *testing.T) {
	t.Run("Parse YAML correctly with correct configuration", func(t *testing.T) {
		_, err := ReadGatewayConfig("testdata/correct.yaml")
		assert.NoError(t, err)
	})

	t.Run("Return error when no routes are found", func(t *testing.T) {
		_, err := ReadGatewayConfig("testdata/no-routes.yaml")
		assert.Error(t, err)
		assert.Equal(t, "no routes found in syntax-config.yaml", err.Error())
	})

	t.Run("Return error when route path is empty", func(t *testing.T) {
		_, err := ReadGatewayConfig("testdata/route-path-empty.yaml")
		assert.Error(t, err)
		assert.Equal(t, "route path cannot be empty", err.Error())
	})

	t.Run("Return error when route method is empty", func(t *testing.T) {
		_, err := ReadGatewayConfig("testdata/route-method-empty.yaml")
		assert.Error(t, err)
		assert.Equal(t, "route method cannot be empty", err.Error())
	})
}
