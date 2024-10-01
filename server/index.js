const express = require('express')
const app = express()

const http = require('http').createServer(app)
const io = require('socket.io')(http, {
    cors: {
        origin: 'http://localhost:8080'
    }
})

let wordlist = require('./wordlist.json').words
//console.log(wordlist)

let rooms = io.of("/").adapter.rooms;
let roomsData = {}

io.on('connection', (socket) => {
    socket.on('createRoom', (data) => {
        let roomId = Date.now().toString()
        socket.username = data.username
        socket.roomIn = roomId

        roomsData[roomId] = {
            game_started: false,
            current_word: null,
            used_words: [],
            userlist: [
                {
                    id: socket.id,
                    username: data.username,
                    color: '#000000',
                    turn: false,
                    fakeArtist: false
                }
            ]
        }

        let userlist = roomsData[roomId].userlist

        socket.join(roomId)
        socket.emit('connected', { id: socket.id, roomId, success: true, userlist})
    })

    socket.on('joinRoom', (data) => {
        let roomId = data.roomId
        let success = false
        socket.username = data.username
        socket.roomIn = roomId
        let userObj = {
            id: socket.id,
            username: data.username,
            color: "#000000",
            turn: false,
            fakeArtist: false,
        }

        if(rooms.has(roomId)) {
            roomsData[roomId].userlist.push(userObj)
            success = true
        }

        let userlist = roomsData[roomId].userlist

        socket.join(roomId)
        socket.emit('connected', { id: socket.id, roomId, success, userlist })
        socket.broadcast.to(roomId).emit('entrou', userObj)
    })

    socket.on('disconnect', () => {
        if(socket.roomIn) {
            io.to(socket.roomIn).emit('saiu', {username: socket.username})
            roomsData[socket.roomIn].userlist = roomsData[socket.roomIn].userlist.filter(user => user.id !== socket.id )
            // Se a sala não existe mais apaga os dados dela no servidor
            if(!rooms.has(socket.roomIn)) {
                delete roomsData[socket.roomIn]
            }
        }
    })

    socket.on('message', (data) => {
        io.to(data.roomId).emit('addMsg', { message: data.message, username: data.user })
    })

    socket.on('sendline', (data) => {
        io.to(socket.roomIn).emit('drawline', {
            from: data.from,
            to: data.to,
            color: data.color,
            /* width: data.width */
        })
    })

    socket.on('startGame', () => {
        let socketRoom = roomsData[socket.roomIn]

        let randomIndex = Math.floor(Math.random() * wordlist.length)
        let userIndex = Math.floor(Math.random() * socketRoom.userlist.length)
        let starterIndex = Math.floor(Math.random() * socketRoom.userlist.length)

        let starterUser = socketRoom.userlist[starterIndex]
        starterUser.turn = true

        let randomUser = socketRoom.userlist[userIndex]
        let randomWord = wordlist[randomIndex]
        
        randomUser.fakeArtist = true
        socketRoom.used_words.push(randomIndex)
        socketRoom.game_started = true

        socket.to(randomUser.id).emit('fakeArtist')
        io.to(socket.roomIn).emit('gameStarted', {word: randomWord, starterId: starterUser.id})
    })

    socket.on('colorChange', (data) => {
        roomsData[socket.roomIn].userlist.forEach((user, index) => {
            if(user.id === data.id) {
                roomsData[socket.roomIn].userlist[index].color = data.color 
            }
        })

        io.to(socket.roomIn).emit('colorChanged', { id: data.id, color: data.color })
    })
})

http.listen(process.env.PORT || 3000, () => {
    console.log('API - OK')
})