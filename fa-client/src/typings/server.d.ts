interface Message {
    Author: string;
    MessageType: MessageTypes;
    Data: any;
}

interface Player {
    Color: string
    Connected: boolean
    Id: string
    Name: string
    Admin: boolean
}

interface ClientPlayer extends Player {
    You: boolean
}

interface Position {
    x: number
    y: number
}