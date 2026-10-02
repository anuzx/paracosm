package main

import "encoding/json"

// incoming
type Message struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

type JoinPayload struct {
	SpaceID string `json:"spaceId"`
	Token   string `json:"token"`
}

type MovePayload struct {
	X int `json:"x"`
	Y int `json:"y"`
}

// outgoing
type Position struct {
	X int `json:"x"`
	Y int `json:"y"`
}

type UserRef struct {
	ID string `json:"id"`
}

type SpaceJoinedPayload struct {
	Spawn Position  `json:"spawn"`
	Users []UserRef `json:"users"`
}

type MovementPayload struct {
	UserID string `json:"userId"`
	X      int    `json:"x"`
	Y      int    `json:"y"`
}

type UserJoinPayload struct {
	UserID string `json:"userId"`
	X      int    `json:"x"`
	Y      int    `json:"y"`
}

type UserLeftPayload struct {
	UserID string `json:"userId"`
}

// encode builds {"type": ..., "payload": ...} and returns the JSON bytes.
func encode(t string, payload any) []byte {
	b, _ := json.Marshal(struct {
		Type    string `json:"type"`
		Payload any    `json:"payload"`
	}{t, payload})
	return b
}
