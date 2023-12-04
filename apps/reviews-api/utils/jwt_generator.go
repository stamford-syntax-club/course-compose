package utils

import (
	"os"

	"github.com/golang-jwt/jwt/v5"
)

// A helper function to generate a JWT token fo testing
// This function is not used in the production code, actual JWT token is generated by Supabase
func GenerateNewAccessToken(id, email string, exp int64) (string, error) {
	// Set secret key from .env file.
	secret := os.Getenv("JWT_SECRET")

	// Create a new claims.
	claims := jwt.MapClaims{}

	// Set public claims:
	claims["sub"] = id
	claims["exp"] = exp
	claims["email"] = email

	// Create a new JWT access token with claims.
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Generate token.
	t, err := token.SignedString([]byte(secret))
	if err != nil {
		// Return error, it JWT token generation failed.
		return "", err
	}

	return t, nil
}
