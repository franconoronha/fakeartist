package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"

	"github.com/gorilla/websocket"
)

const PORT = ":8080"

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func newPlayer(name string, connection *websocket.Conn, roomId string, admin bool) Player {
	return Player{
		Id:         generateUniqueCode(),
		connection: connection,
		Connected:  true,
		Name:       name,
		Color:      "#000000",
		roomIn:     roomId,
		Admin:      admin,
	}
}

func generateUniqueCode() string {
	const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	code := make([]byte, 6)
	for i := range code {
		code[i] = letters[rand.Intn(len(letters))]
	}
	return string(code)
}

func (rooms *Rooms) messageHandler(message []byte, player *Player) {
	var baseMsg IncomingMessage

	// Unmarshal the message into a base message
	if err := json.Unmarshal(message, &baseMsg); err != nil {
		fmt.Println("Error unmarshaling base message (1):", err)
		return
	}

	// Handle the message based on the action
	switch baseMsg.Action {
	case ChatMessage:
		var sendMsgData IncomingChatMessage
		if err := json.Unmarshal(baseMsg.Data, &sendMsgData); err != nil {
			fmt.Println("Error unmarshaling sendMessage data (2):", err)
			return
		}

		var outChatMsg = OutgoingMessage{
			Author: player.Name,
			Text:   sendMsgData.Text,
		}
		rooms.Roomcast(Message{player.Name, ChatMessage, outChatMsg}, player.roomIn, player.Id, true)
	case StartGame:
		if player.Admin {
			rooms.Roomcast(Message{player.Name, StartGame, nil}, player.roomIn, player.Id, false)
		} else {
			fmt.Println("Player is not admin")
		}
	case ChangeColor:
		var colorData ChangeColorMessage
		if err := json.Unmarshal(baseMsg.Data, &colorData); err != nil {
			fmt.Println("Error unmarshaling changeColor data (2):", err)
			return
		}

		player.Color = colorData.Color
		rooms.Roomcast(Message{"server", ChangeColor, colorData}, player.roomIn, player.Id, false)
	default:
		fmt.Printf("Unknown action: %d\n", baseMsg.Action)
	}
}

// blablablabla
func (rooms *Rooms) createRoom(w http.ResponseWriter, r *http.Request) {
	var name = r.URL.Query().Get("name")
	if name == "" {
		fmt.Println("No name provided")
		return
	}

	connection, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println(err)
		return
	}

	var roomId = generateUniqueCode()
	rooms.rooms[roomId] = Room{
		make(map[string]Player),
		false,
	}

	var player = newPlayer(name, connection, roomId, true)
	rooms.rooms[roomId].players[player.Id] = player

	var roomCreatedMessage = Message{
		"server",
		RoomCreated,
		roomId,
	}

	var getPlayersMessage = Message{
		"server",
		GetPlayers,
		GetPlayersMessage{
			Players: rooms.rooms[roomId].players,
			You:     player.Id,
		},
	}

	rooms.Playercast(roomCreatedMessage, player)
	rooms.Playercast(getPlayersMessage, player)

	fmt.Printf("Player %s created room %s\n", player.Name, roomId)
	go rooms.messageLoop(player, roomId)
}

func (rooms *Rooms) joinRoom(w http.ResponseWriter, r *http.Request) {
	var roomId = r.URL.Query().Get("id")
	var name = r.URL.Query().Get("name")
	if roomId == "" {
		fmt.Println("No room id provided")
		return
	}
	if name == "" {
		fmt.Println("No name provided")
		return
	}

	if _, ok := rooms.rooms[roomId]; ok {
		connection, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			fmt.Println(err)
			return
		}

		var player = newPlayer(name, connection, roomId, false)
		rooms.rooms[roomId].players[player.Id] = player

		var joinMessage = Message{
			player.Name,
			AddPlayer,
			player,
		}

		var getPlayersMessage = Message{
			"server",
			GetPlayers,
			GetPlayersMessage{
				Players: rooms.rooms[roomId].players,
				You:     player.Id,
			},
		}

		go rooms.Roomcast(joinMessage, roomId, player.Id, true)
		go rooms.Playercast(getPlayersMessage, player)

		fmt.Printf("Player %s joined room %s\n", name, roomId)
		go rooms.messageLoop(player, roomId)
	} else {
		fmt.Println("Room does not exist")
	}
}

func (rooms *Rooms) messageLoop(player Player, roomId string) {
	for {
		mt, message, err := player.connection.ReadMessage()
		if err != nil || mt == websocket.CloseMessage {
			fmt.Println(err)
			break
		}

		go rooms.messageHandler(message, &player)
	}

	fmt.Printf("Connection closed for player %s on room %s\n", player.Name, roomId)
	player.connection.Close()
	rooms.Roomcast(Message{player.Name, PlayerLeft, player.Id}, roomId, player.Id, true)

	delete(rooms.rooms[roomId].players, player.Id)
	if len(rooms.rooms[roomId].players) == 0 {
		fmt.Printf("Room %s is empty, deleting\n", roomId)
		delete(rooms.rooms, roomId)
	}
}

func (rooms *Rooms) Roomcast(message interface{}, roomId string, playerId string, ignorePlayer bool) error {
	// Marshal the message into JSON
	jsonMessage, err := json.Marshal(message)
	if err != nil {
		fmt.Println(err)
		return err // handle marshaling error
	}

	for _, player := range rooms.rooms[roomId].players {
		if ignorePlayer && player.Id == playerId {
			continue
		}

		err := player.connection.WriteMessage(websocket.TextMessage, jsonMessage)
		if err != nil {
			fmt.Println(err)
			return err // handle write error
		}
	}
	return nil
}

func (rooms *Rooms) Playercast(message Message, player Player) error {
	// Marshal the message into JSON
	jsonMessage, err := json.Marshal(message)
	if err != nil {
		fmt.Println(err)
		return err // handle marshaling error
	}

	err = player.connection.WriteMessage(websocket.TextMessage, jsonMessage)
	if err != nil {
		fmt.Println(err)
		return err // handle write error
	}
	return nil
}

func main() {
	rooms := Rooms{
		make(map[string]Room),
	}

	http.HandleFunc("/createRoom", rooms.createRoom)
	http.HandleFunc("/joinRoom", rooms.joinRoom)

	fmt.Println("Server running on port ", PORT)
	http.ListenAndServe(PORT, nil)
}
