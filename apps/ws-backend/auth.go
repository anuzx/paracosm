package main

import (
	"errors"
	"os"

	"github.com/golang-jwt/jwt/v5"
)

func verifyToken(tokenStr string) (string, error) {
	secret := os.Getenv("JWT_SECRET")

	token, err := jwt.Parse(
		tokenStr,
		func(t *jwt.Token) (any, error) {
			return []byte(secret), nil
		},
		jwt.WithValidMethods([]string{"HS256"}),
	)
	if err != nil {
		return "", err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", errors.New("unexpected claims type")
	}

	id, ok := claims["id"].(string)
	if !ok || id == "" {
		return "", errors.New("token has no id")
	}

	return id, nil
}
