package main

import (
	"encoding/json"

	"github.com/gorilla/websocket"
)

type Rooms struct {
	rooms map[string]Room
}

type Room struct {
	players map[string]Player
	inGame  bool
}

type Player struct {
	Id         string
	connection *websocket.Conn
	Connected  bool
	Color      string
	Name       string
	roomIn     string
	Admin      bool
}

type MessageType int

const (
	AddPlayer MessageType = iota
	GetPlayers
	RoomCreated
	PlayerLeft
	ChatMessage
	StartGame
	ChangeColor
)

type Message struct {
	Author      string
	MessageType MessageType
	Data        interface{}
}

type GetPlayersMessage struct {
	Players map[string]Player
	You     string
}

type IncomingMessage struct {
	Action MessageType     `json:"Action"`
	Data   json.RawMessage `json:"Data"`
}

type IncomingChatMessage struct {
	Text string `json:"Text"`
}

type OutgoingMessage struct {
	Author string
	Text   string
}

type ChangeColorMessage struct {
	Color  string `json:"Color"`
	Player string `json:"Player"`
}
