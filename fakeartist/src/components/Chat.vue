<template>
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
</template>

<script>
export default {
    name: "Chat",
    props: ['username', 'room'],
    data() {
        return {
            message: ""
        }
    },
    methods: {
        createMessage(text) {
            const chat = document.getElementById("chat");
            let msg = document.createElement("p");
            msg.innerHTML = text;
            chat.append(msg);
        },
        sendMessage() {
            if (this.message.length > 0) {
                this.$socket.client.emit("message", {
                    roomId: this.room,
                    message: this.message,
                    user: this.username,
                });
                this.message = "";
            }
        },
    },
    sockets: {
        entrou(data) {
            let message = `--${data.username} entrou na sala`;
            this.createMessage(message);
        },
        addMsg(data) {
            let message = `${data.username}: ${data.message}`;
            this.createMessage(message);
        },
        saiu(data) {
            let message = `--${data.username} saiu da sala`;
            this.createMessage(message);
        }
    }
}
</script>

<style lang="scss" scoped>
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
</style>