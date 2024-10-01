<template>
    <div class="flex flex-col gap-5 items-center">
        <h1 id="main-title" class="mb-5">Fake Artist</h1>
        <div class="flex gap-10">
            <div class="flex flex-col gap-2">
                <input 
                    type="text"
                    placeholder="Nome"
                    maxlength="32"
                    class="main-input" 
                    v-model="username"
                />         
                <button @click="createRoom">Criar Sala</button>
            </div>
            <div class="flex flex-col gap-2">
                <input 
                    type="text"
                    placeholder="Código da Sala"
                    maxlength="6" 
                    class="main-input" 
                    @input="e => { room = (e.target as HTMLInputElement)?.value }"
                />
                <button @click="joinRoom">Entrar na Sala</button>
            </div>
        </div>

        <div v-show="error">
            <p class="text-red-800">{{ errorMessage }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from "vue";
import store from "../lib/store";
import type ServerConnection from "../lib/ServerConnection";
const serverConnection = inject("serverConnection") as ServerConnection;

let username = defineModel("username", { type: String, default: "Franco" });
let room = "";
const errorMessage = ref<string>("");
const error = ref(false);

onMounted(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
        username.value = storedUsername;
    }
});

const createRoom = () => {
    if (username.value.trim().length === 0) {
        errorMessage.value = "Nome inválido";
        error.value = true;
        return;
    }

    localStorage.setItem("username", username.value);
    const success = serverConnection.createRoom(username.value, () => {
        store.inGame = true;
    });
    if (success) {
        store.inGame = true;
    }
};

const joinRoom = () => {
    if (username.value.trim().length === 0) {
        errorMessage.value = "Nome inválido";
        error.value = true;
        return;
    }
    if (room.trim().length !== 6) {
        errorMessage.value = "Código da sala inválido";
        error.value = true;
        return;
    }

    localStorage.setItem("username", username.value);
    const success = serverConnection.joinRoom(username.value, room);
    if (success) {
        store.inGame = true;
    }
};
</script>

<style scoped>
#main-title {
    font-family: math;
    font-size: 6rem;
    background: -webkit-linear-gradient(#fff, rgb(255, 66, 97));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
</style>