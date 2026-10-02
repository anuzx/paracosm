package main

import (
	"context"
	"errors"
	"os"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var db *pgxpool.Pool

var errSpaceNotFound = errors.New("space not found")

func connectDB() error {
	pool, err := pgxpool.New(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil {
		return err
	}
	if err := pool.Ping(context.Background()); err != nil {
		return err
	}
	db = pool
	return nil
}

// loadSpace reads a space's size and its static elements from Postgres.
func loadSpace(ctx context.Context, id string) (*Space, error) {
	var width int
	var height *int // pointer, because the column is nullable

	err := db.QueryRow(ctx,
		`SELECT width, height FROM "Space" WHERE id = $1`, id,
	).Scan(&width, &height)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errSpaceNotFound
	}
	if err != nil {
		return nil, err
	}
	if height == nil {
		return nil, errors.New("space has no height")
	}

	rows, err := db.Query(ctx, `
		SELECT se.x, se.y
		FROM "spaceElements" se
		JOIN "Element" e ON e.id = se."elementId"
		WHERE se."spaceId" = $1 AND e.static = true`, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	blocked := make(map[Point]bool)
	for rows.Next() {
		var p Point
		if err := rows.Scan(&p.X, &p.Y); err != nil {
			return nil, err
		}
		blocked[p] = true
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return &Space{
		width:   width,
		height:  *height,
		blocked: blocked,
		clients: make(map[*Client]bool),
	}, nil
}