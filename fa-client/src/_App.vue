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
  
          <Userlist :userlist="userlist" />
  
          <div id="start-game" v-show="!gameStarted">
            <p>Choose color: </p>
            <div class="brushOptions">
            <input type="color" @change="colorChange()" v-model="color">
            </div>
            <button @click="startGame()">Start Game</button>
          </div>
  
          <CanvasArea :hint="hint" :currentWord="currentWord" :your_turn="your_turn" :fakeArtist="fakeArtist" :gameStarted="gameStarted" :color="color"/>
  
          <button v-if="your_turn" @click="nextTurn()"> End turn </button>
        </div>
  
        <Chat :username="username" :room="room"/>
      </div>
    </div>
  </template>
  
  <script>
  import Chat from "./components/Chat.vue";
  import CanvasArea from "./components/Board.vue";
  import Userlist from "./components/Userlist.vue";
  
  export default {
      components: { Chat, CanvasArea, Userlist },
      name: "App",
      data() {
          return {
              id: "",
              username: "",
              onRoom: false,
              room: "",
              error: false,
              errorMsg: "",
              hint: "",
              currentWord: "",
              userlist: [],
              fakeArtist: false,
              gameStarted: false,
              your_turn: false,
          };
      },
      sockets: {
        connected(data) {
              if (data.success) {
                  this.clearError();
                  this.id = data.id;
                  this.onRoom = true;
                  this.room = data.roomId;
                  this.userlist = data.userlist;
              }
              else {
                  this.setError("Sala não encontrada");
              }
          },
          saiu(data) {
              this.userlist = this.userlist.filter((user) => user.username !== data.username);
          },
          fakeArtist() {
              this.fakeArtist = true;
          },
          entrou(data) {
              this.userlist.push(data);
          },
          gameStarted(data) {
              this.currentWord = data.word[0];
              this.hint = data.word[1];
              let starterId = this.userlist.findIndex(user => user.id === data.starterId);
              if (!isNaN(starterId))
                  this.userlist[starterId].turn = true;
              if (data.starterId === this.id)
                  this.your_turn = true;
              this.gameStarted = true;
          },
          colorChanged(data) {
              let userIndex = this.userlist.findIndex(user => user.id === data.id);
              if (!isNaN(userIndex))
                  this.userlist[userIndex].color = data.color;
          }
      },
      methods: {
          createRoom() {
              if (this.username.length > 0) {
                  this.clearError();
                  this.$socket.client.emit("createRoom", { username: this.username });
              }
              else {
                  this.setError("Escolha um nome");
              }
          },
          joinRoom() {
              if (this.username.length > 0) {
                  this.clearError();
                  let roomId = this.room;
                  if (roomId.length > 0) {
                      this.$socket.client.emit("joinRoom", { roomId, username: this.username });
                  }
                  else {
                      this.setError("Digite o id da sala para entrar");
                  }
              }
              else {
                  this.setError("Escolha um nome");
              }
          },
          startGame() {
              this.$socket.client.emit("startGame");
          },
          clearError() {
              this.error = false;
              this.errorMsg = "";
          },
          setError(msg) {
              this.error = true;
              this.errorMsg = msg;
          },
          copy() {
              navigator.clipboard.writeText(this.room);
          },
          colorChange() {
              this.$socket.client.emit("colorChange", {
                  id: this.id,
                  color: this.color
              });
          },
          nextTurn() {
              this.$socket.client.emit("nextTurn");
          }
      }
  }
  </script>
  
  <style lang="scss">
  /* AREA DO JOGO */
  #main {
    padding: 10px;
    min-height: 50vh;
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
  </style>
  