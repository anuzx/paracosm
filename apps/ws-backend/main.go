package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func handleWs(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		log.Println("upgrade failed:", err)
		return
	}

	c := &Client{conn: conn}

	defer func() {
		handleLeave(c)
		conn.Close()
	}()

	for {
		_, data, err := conn.ReadMessage()
		if err != nil {
			log.Println("client left:", err)
			return
		}

		var msg Message
		if err := json.Unmarshal(data, &msg); err != nil {
			log.Println("bad json:", err)
			continue
		}

		switch msg.Type {
		case "join":
			handleJoin(c, msg.Payload)

		case "move":
			handleMove(c, msg.Payload)

		default:
			log.Println("unknown type:", msg.Type)

		}

	}

}

func main() {
	if os.Getenv("JWT_SECRET") == "" {
		log.Fatal("JWT_SECRET is not set")
	}

	if err := connectDB(); err != nil {
		log.Fatal("Db connection issue", err)
	}

	http.HandleFunc("/ws", handleWs)
	log.Println("listening on :8000")
	log.Fatal(http.ListenAndServe(":8000", nil))
}
