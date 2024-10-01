import store from "./store";
import emitter from "./mitt";

enum MessageTypes {
    AddPlayer,
    GetPlayers,
    RoomCreated,
    PlayerLeft,
    ChatMessage,
    StartGame,
    ChangeColor
}

export default class ServerConnection {
    static types = MessageTypes;
    wsURL = "";
    connection: WebSocket | null = null;
    connected = false;
    room = "";
    username = "";
    id = "";
    connectedCallback = () => {};

    constructor(server: string) {
        this.wsURL = "ws://" + server;
    }

    sendMessage(data: any) {
        if (this.connection === null) {
            console.error("Conexão não estabelecida");
            return;
        }
    
        try {
            this.connection.send(JSON.stringify(data));
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }
    
    setupConnection(username: string, room?: string) {
        if (!this.connection) return;
        this.username = username;
        if (room) this.room = room;

        this.connection.onclose = () => {
            console.log("connection closed");
            this.connected = false;
            this.room = "";
            this.id = "";
            store.inGame = false;
            store.roomId = "";
            store.userlist = [];
        }
    
        this.connection.onopen = () => {
            console.log("connection opened");
            this.connected = true;
        }
    
        this.connection.onmessage = data => {
            try {
                console.log(data);
                const message = JSON.parse(data.data);
                this.messageHandler(message as Message);
            } catch (e) {
                console.log(e, data);
            }
        }
    }

    messageHandler(message: Message) {
        console.log(message);

        switch (message.MessageType) {
            case MessageTypes.AddPlayer:
                this.addPlayer(message);
                break;
            case MessageTypes.GetPlayers:
                this.getPlayers(message);
                break;
            case MessageTypes.PlayerLeft:
                this.playerLeft(message);
                break;
            case MessageTypes.RoomCreated:
                this.roomCreated(message);
                break;
            case MessageTypes.ChatMessage:
                emitter.emit("chatMessage", message.Data);
                break;
            case MessageTypes.StartGame:
                store.inGame = true;
                break;
            case MessageTypes.ChangeColor:
                store.changeColor(message.Data);
                break;
            default:
                console.log("Tipo de mensagem desconhecido");
        }
    }
    
    playerLeft(message: Message) {
        if (message.Data) {
            store.userlist = store.userlist.filter((player: Player) => player.Id !== message.Data);
        } else {
            console.warn("PlayerLeft message without data");
        }
    }

    addPlayer(message: Message) {
        if (message.Data) {
            store.userlist.push(message.Data);
        } else {
            console.warn("AddPlayer message without data");
        }
    }

    getPlayers(message: Message) {
        if (message.Data) {
            this.id = message.Data.You;
            store.id = message.Data.You;
            for(const playerId of Object.keys(message.Data.Players)) {
                const player = message.Data.Players[playerId]; 
                store.userlist.push(player);
                if (player.Admin && playerId === store.id) {
                    store.admin = true;
                }
            }
        } else {
            console.warn("GetPlayers message without data");
        }
    }

    roomCreated(message: Message) {
        this.room = message.Data;
        // talvez ao invés de ter duas fontes de verdade, a store poderia ser a única, ou então usar watch
        store.roomId = message.Data;
        this.connectedCallback();
    }

    leaveRoom() {
        if (this.connection) {
            this.connection.close();
        }
    }

    createRoom(username: string, connectedCallback: () => void) {
        const name = username.trim();
        if (name.length === 0) {
            console.log("Nome inválido");
            return;
        }
        
        this.connectedCallback = connectedCallback;
    
        const params = new URLSearchParams({
            name: name
        } as any);
    
        try {
            this.connection = new WebSocket(this.wsURL + "/createRoom?" + params.toString());
            if (this.connection) {
                this.setupConnection(username);
                return true;
            }
            return false;
        } catch (e) {
            console.log(e);
            return false;
        }
    }
    
    joinRoom(username: string, room: string) {
        const name = username.trim();
        if (name.length === 0) {
            console.log("Nome inválido");
            return;
        }
    
        if (room.length !== 6) {
            console.log("Código da sala inválido");
            return;
        }

        room = room.toUpperCase();
    
        const params = new URLSearchParams({
            name: name,
            id: room
        } as any);
    
        try {
            this.connection = new WebSocket(`${this.wsURL}/joinRoom?${params.toString()}`);
            if (this.connection) {
                this.setupConnection(username, room);
                return true;
            }
            return false;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    startGame() {
        if (store.admin) {
            this.sendMessage(JSON.stringify({
                MessageType: MessageTypes.StartGame
            }));
        }
    }
}