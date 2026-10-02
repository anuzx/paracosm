package main

import (
	"sync"

	"github.com/gorilla/websocket"
)

type Client struct {
	conn    *websocket.Conn
	writeMu sync.Mutex // one write at a time per connection
	userID  string
	spaceID string // "" until they join
	x, y    int
}

type Point struct {
	X, Y int
}

type Space struct {
	width, height int
	blocked       map[Point]bool   // tiles covered by static elements
	clients       map[*Client]bool // who is inside
}

// ONE lock for all shared state.
var (
	mu     sync.Mutex
	spaces = make(map[string]*Space)
)

func send(c *Client, msg []byte) {
	c.writeMu.Lock()
	defer c.writeMu.Unlock()
	c.conn.WriteMessage(websocket.TextMessage, msg)
}

// The caller must already hold mu.
func broadcast(spaceID string, msg []byte, except *Client) {
	space := spaces[spaceID]
	if space == nil {
		return
	}
	for c := range space.clients {
		if c != except {
			send(c, msg)
		}
	}
}

// The caller must already hold mu.
func occupied(space *Space, x, y int, except *Client) bool {
	for other := range space.clients {
		if other != except && other.x == x && other.y == y {
			return true
		}
	}
	return false
}

func abs(n int) int {
	if n < 0 {
		return -n
	}
	return n
}
