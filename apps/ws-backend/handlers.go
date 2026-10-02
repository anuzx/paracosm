package main

import (
	"context"
	"encoding/json"
	"log"
	"time"
)

func handleJoin(c *Client, raw json.RawMessage) {
	var p JoinPayload
	if err := json.Unmarshal(raw, &p); err != nil {
		return
	}

	userID, err := verifyToken(p.Token)
	if err != nil {
		log.Println("auth failed:", err)
		c.conn.Close() // the read loop will fail and clean up
		return
	}

	// slow work BEFORE the lock
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	loaded, err := loadSpace(ctx, p.SpaceID)
	if err != nil {
		log.Println("load space:", err)
		c.conn.Close()
		return
	}

	mu.Lock()
	defer mu.Unlock()

	if c.spaceID != "" {
		return // already in a space
	}

	// reuse the live room if there is one, otherwise register the one we loaded
	space, ok := spaces[p.SpaceID]
	if !ok {
		space = loaded
		spaces[p.SpaceID] = space
	}

	// same account can't be in a room twice
	for other := range space.clients {
		if other.userID == userID {
			c.conn.Close()
			return
		}
	}

	users := []UserRef{}
	for other := range space.clients {
		users = append(users, UserRef{ID: other.userID})
	}

	// first free tile on the top row
	x := 0
	for x < space.width && (occupied(space, x, 0, nil) || space.blocked[Point{x, 0}]) {
		x++
	}
	if x >= space.width {
		c.conn.Close() // no free spawn tile
		return
	}

	c.userID = userID
	c.spaceID = p.SpaceID
	c.x, c.y = x, 0
	space.clients[c] = true

	send(c, encode("space-joined", SpaceJoinedPayload{
		Spawn: Position{X: c.x, Y: c.y},
		Users: users,
	}))
	broadcast(p.SpaceID, encode("user-join", UserJoinPayload{
		UserID: c.userID, X: c.x, Y: c.y,
	}), c)
}

func handleMove(c *Client, raw json.RawMessage) {
	var p MovePayload
	if err := json.Unmarshal(raw, &p); err != nil {
		return
	}

	mu.Lock()
	defer mu.Unlock()

	if c.spaceID == "" {
		return // must join first
	}
	space := spaces[c.spaceID]

	inBounds := p.X >= 0 && p.Y >= 0 && p.X < space.width && p.Y < space.height
	oneStep := abs(p.X-c.x)+abs(p.Y-c.y) == 1

	if !inBounds || !oneStep || space.blocked[Point{p.X, p.Y}] || occupied(space, p.X, p.Y, c) {
		send(c, encode("movement-rejected", Position{X: c.x, Y: c.y}))
		return
	}

	c.x, c.y = p.X, p.Y
	broadcast(c.spaceID, encode("movement", MovementPayload{
		UserID: c.userID, X: c.x, Y: c.y,
	}), c)
}

func handleLeave(c *Client) {
	mu.Lock()
	defer mu.Unlock()

	if c.spaceID == "" {
		return // never joined
	}

	space := spaces[c.spaceID]
	delete(space.clients, c)
	broadcast(c.spaceID, encode("user-left", UserLeftPayload{UserID: c.userID}), c)

	if len(space.clients) == 0 {
		delete(spaces, c.spaceID) // empty room, forget it
	}
}