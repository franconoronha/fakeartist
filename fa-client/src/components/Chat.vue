<template>
    <div id="chat-container" class="h-full border-0 border-l border-solid border-[#c0c0c0]">
        <div id="chat-area" class="flex flex-col h-full justify-end items-start">
            <div ref="chat" class="flex flex-col pl-1"></div>
            <div class="flex">
                <input
                    type="text"
                    id="mensagem"
                    placeholder="Mensagem"
                    v-model="message"
                />
                <button @click="sendMessage" v-bind:disabled="message.length === 0">
                    Enviar
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import ServerConnection  from "../lib/ServerConnection";
import { onMounted, onUnmounted, ref, inject } from "vue";
import emitter from "../lib/mitt";
import store from "../lib/store";

const sc = inject("serverConnection") as ServerConnection;
const chat = ref<HTMLDivElement | null>(null);
const message = ref("");

onMounted(() => {
    emitter.on("chatMessage", data => {
        createMessage(data);
    });
});

onUnmounted(() => {
    emitter.off("chatMessage", data => {
        createMessage(data);
    });
});

function createMessage(data: any) {
    if (chat.value) {
        let msg = document.createElement("p");
        msg.innerHTML = `${data.Author}: ${data.Text}`;
        chat.value.append(msg);
    }
}

function sendMessage() {
    if (message.value.length > 0) {
        const msg = {
            Action: ServerConnection.types.ChatMessage,
            Data: {
                Text: message.value
            }
        };
        const success = sc.sendMessage(msg);
        if (success) {
            createMessage({
                Author: sc.username,
                Text: message.value
            });
            message.value = "";
        }
    }
}
</script>

<style lang="scss" scoped>
</style>