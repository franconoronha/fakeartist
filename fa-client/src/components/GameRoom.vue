<template>
    <div class="flex flex-col">
        <div class="flex gap-5 items-center mb-2">
            <p @click="copyRoomCode" class="cursor-pointer">Sala: <b>{{ store.roomId }}</b></p>
            <button class="red-button" @click="leaveGame">Sair</button>
            <button v-if="store.admin" class="green-button" @click="startGame">Começar</button>
        </div>
        <div id="mainContent" class="flex h-full border border-solid border-[#c0c0c0] bg-[#030404] rounded">
            <Userlist></Userlist>
            <Board></Board>
            <Chat></Chat>
        </div>
    </div>
</template>

<script setup lang="ts">
import { inject } from "vue";
import store from "../lib/store";
import Userlist from "./Userlist.vue";
import Chat from "./Chat.vue";
import Board from "./Board.vue";
import type ServerConnection from "../lib/ServerConnection";

const serverConnection = inject("serverConnection") as ServerConnection;

function leaveGame() {
    serverConnection.leaveRoom();
    store.inGame = false;
}

function copyRoomCode() {
    navigator.clipboard.writeText(store.roomId);
}

function startGame() {
    serverConnection.startGame();
}
</script>

<style scoped>
#mainContent {
    height: 80vh;
}
</style>