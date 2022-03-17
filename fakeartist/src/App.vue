<template>
  <div id="main">
    <div v-if="error">
      <p>{{ errorMsg }}</p>
    </div>

    <div id="login" v-if="!onRoom">
      <input
      type="text"
      id="username"
      v-model="username"
      placeholder="Nome"
      />

      <div id="joinMenu">
        <button @click="createRoom">Criar Sala</button>

        <p>Ou</p>
        <input type="text" v-model="room" placeholder="ID da Sala" />
        <button @click="joinRoom">Entrar</button>
      </div>
    </div>

    <div id="room" v-show="onRoom">
      <div class="flex gap-10">
        <p>Sala: {{ room }}</p>
        <button @click="copy()">Copy</button>
      </div>

      <div id="main" class="flex">
        <div id="chat-list">
          <div class="user flex gap-10" v-for="(user, index) in userlist" :key="index" :class="{active: user.turn}">
              <p>{{ user.username }}</p>
              <div class="user-color" :style="{backgroundColor: user.color}"></div>
          </div>
        </div>

        <div id="start-game" v-show="!gameStarted">
          <p>Choose color: </p>
          <div class="brushOptions">
          <input type="color" @change="colorChange()" v-model="color">
          <input type="number" v-model="width">
          </div>
          <button @click="startGame()">Start Game</button>
        </div>

        <div id="canvas-area" v-show="gameStarted" @mouseenter="setOffset()">
          <h1 v-show="gameStarted">{{ hint }}</h1>
          <h2 v-if="!fakeArtist"> {{ currentWord }} </h2>
          <h2 v-else> Você é o artista falso </h2>
          <canvas
          id="canvas"
          ref="canvas"
          @mousedown="seguraMouse()"
          @mouseout="this.mousePressed = false"
          @mouseup="this.mousePressed = false"
          @mousemove="coordenadas($event)"
          >
          </canvas>
        </div>
        <button v-if="your_turn" @click="nextTurn()"> End turn </button>
      </div>

      <div id="chat-container">
        <div id="chat-area">
          <div id="chat"></div>
          <form @submit.prevent="sendMessage">
            <input
            type="text"
            id="mensagem"
            placeholder="Mensagem"
            v-model="message"
            />
            <button @click="sendMessage" v-bind:disabled="message.length === 0">
              Enviar
            </button>
          </form>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script>
/* import socketFunctions from './assets/socketFunctions.js' */
import { io } from "socket.io-client"
const socket = io("http://localhost:3000")

export default {
  name: "App",

  data() {
    return {
      id: "",
      username: "",
      onRoom: false,
      room: "",
      error: false,
      errorMsg: "",
      message: "",
      hint: "",
      currentWord: "",
      userlist: [],
      mousePressed: false,
      pos: {
        x: 0,
        y: 0
      },
      offset: {
        x: 0,
        y: 0
      },
      ultimaPos: {
        x: 0,
        y: 0
      },
      color: '#000000',
      width: 10,
      context: {
        strokeStyle: null,
        lineWidth: null,
      },
      gameStarted: false,
      your_turn: false,
      fakeArtist: false,
    }
  },
  created() {
    socket.on("connected", (data) => {
      if (data.success) {
        this.clearError()

        this.id = data.id
        this.onRoom = true
        this.room = data.roomId

        this.userlist = data.userlist
      } else {
        this.setError("Sala não encontrada")
      }
    })

    socket.on("addMsg", (data) => {
      let message = `${data.username}: ${data.message}`
      this.createMessage(message)
    })

    socket.on("saiu", (data) => {
      let message = `--${data.username} saiu da sala`
      this.createMessage(message)

      this.userlist = this.userlist.filter((user) => user.username !== data.username)
    })

    socket.on('fakeArtist', () => {
      this.fakeArtist = true
    })

    socket.on("entrou", (data) => {
      let message = `--${data.username} entrou na sala`
      this.createMessage(message)
      this.userlist.push(data)
    })

    socket.on("gameStarted", (data) => {
      this.currentWord = data.word[0]
      this.hint = data.word[1]

      let starterId = this.userlist.findIndex(user => user.id === data.starterId)
      if(!isNaN(starterId)) this.userlist[starterId].turn = true
      if(data.starterId === this.id) this.your_turn = true
      this.setupCanvas()
      this.gameStarted = true
    })

    socket.on('drawline', (data) => {
      this.receive(data.from, data.to, data.color, data.width)
    })

    socket.on('colorChanged', (data) => {
      let userIndex = this.userlist.findIndex(user => user.id === data.id)
      if(!isNaN(userIndex)) this.userlist[userIndex].color = data.color
    })
  },
  mounted() {

  },
  methods: {
    setOffset() {
      let rect = this.$refs.canvas.getBoundingClientRect()
      this.offset = {
        x: rect.left,
        y: rect.top
      }
    },

    setupCanvas() {
      let canvas = this.$refs.canvas
      this.context = canvas.getContext('2d')
      canvas.width = 500
      canvas.height = 500

      this.context.lineCap = 'round'
      this.context.strokeStyle = 'black'
      this.context.lineWidth = 10

      setInterval(() => {
        this.drawer()
      }, 50)
    },

    createRoom() {
      if (this.username.length > 0) {
        this.clearError()
        socket.emit("createRoom", { username: this.username })
      } else {
        this.setError("Escolha um nome")
      }
    },

    joinRoom() {
      if (this.username.length > 0) {
        this.clearError()
        let roomId = this.room
        if (roomId.length > 0) {
          socket.emit("joinRoom", { roomId, username: this.username })
        } else {
          this.setError("Digite o id da sala para entrar")
        }
      } else {
        this.setError("Escolha um nome")
      }
    },

    startGame() {
      socket.emit('startGame')
    },

    sendMessage() {
      if (this.message.length > 0) {
        socket.emit("message", {
          roomId: this.room,
          message: this.message,
          user: this.username,
        })
        this.message = ""
      }
    },

    createMessage(text) {
      const chat = document.getElementById("chat")
      let msg = document.createElement("p")
      msg.innerHTML = text
      chat.append(msg)
    },

    clearError() {
      this.error = false
      this.errorMsg = ""
    },

    setError(msg) {
      this.error = true
      this.errorMsg = msg
    },

    coordenadas(event) {
      this.pos = {
        x: event.clientX,
        y: event.clientY
      }
      this.movement = {
        x: event.movementX,
        y: event.movementY
      }
    },

    drawer() {
      if(this.mousePressed && this.your_turn) {
        if(this.pos.x !== this.ultimaPos.x && this.pos.y !== this.ultimaPos.y) {
          socket.emit('sendline', {
            from: {
              x: this.ultimaPos.x - this.offset.x,
              y: this.ultimaPos.y - this.offset.y
            },
            to: {
              x: this.pos.x - this.offset.x,
              y: this.pos.y - this.offset.y
            },
            color: this.color,
            /* width: this.width */
          })

          this.ultimaPos.x = this.pos.x
          this.ultimaPos.y = this.pos.y
        }
      }
    },

    receive(from, to, color, width) {
      this.context.strokeStyle = color
      this.context.lineWidth = width
      this.context.beginPath()
      this.context.moveTo(from.x, from.y)
      this.context.lineTo(to.x, to.y)
      this.context.stroke()
    },

    largaMouse() {
      this.mousePressed = false
    },

    seguraMouse() {
      this.mousePressed = true
      this.ultimaPos.x = this.pos.x
      this.ultimaPos.y = this.pos.y
    },

    copy() {
      navigator.clipboard.writeText(this.room)
    },

    colorChange() {
      socket.emit("colorChange", {
        id: this.id,
        color: this.color
      })
    },

    nextTurn() {
      socket.emit("nextTurn")
    }
  },
}
</script>

<style lang="scss">
/* GERAL */
* {
  margin: 0;
}

.flex {
  display: flex;
}

.gap-10 {
  gap: 10px;
}

/* AREA DO JOGO */
#main {
  padding: 10px;
  min-height: 50vh;
}

#canvas {
  outline: 1px solid red;
}

/* TELA DE INICIO */
#login {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 15px;

  #joinMenu {
    display: flex;
    gap: 10px;
  }
}

/* CHAT */
#chat {
  background-color: aliceblue;
  height: 200px;
  overflow-y: scroll;
}

#chat-list {
  width: 20%;
  padding-inline: 10px;
}

#chat-container {
  display: flex;
}

#chat-area {
  width: 100%;
}

/* LISTA DE USUARIOS */
.user {
  align-items: center;
  padding: 7px;
  .user-color {
    width: 15px;
    aspect-ratio: 1;
    border-radius: 50%;
  }

  &.active {
    border: 1px solid green;
  }
}


</style>
