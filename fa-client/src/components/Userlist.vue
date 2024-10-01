<template>
    <div class="border-0 border-r border-solid border-[#c0c0c0]">
        <div 
          class="user flex gap-3 border-0 border-b border-solid border-[#3d3d3d]" 
          v-for="(user, index) in store.userlist" 
          :key="index" 
          :class="{ active: false }"
        >
            <p :class="{ 'text-green-500': store.id === user.Id }">
              {{ user.Name }} {{ user.Admin ? "(a)" : "" }}
            </p>
            <button 
              class="red-button"
              v-if="store.admin && store.id !== user.Id" 
              @click="kickPlayer(user)">
                Kick
            </button>
            <div 
              class="user-color" 
              :style="{ backgroundColor: user.Color }" 
              @click="openColorInput(user)">                
            </div>
            <input 
              type="color" 
              :value="user.Color" 
              :id="`color-${user.Id}`" 
              style="opacity: 0;width: 0;"
              @change="(e) => changeColor(e, user.Id)"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { inject } from "vue";
import store from "../lib/store";
import ServerConnection from "../lib/ServerConnection";

const sc = inject("serverConnection") as ServerConnection;

function openColorInput(user: Player) {
  if (store.id !== user.Id) return;

  const el = document.getElementById(`color-${user.Id}`) as HTMLDivElement;
  if (el) {
    el.click();
  }
}

function kickPlayer(user: Player) {
  console.log("Kicking player", user);
}

function changeColor(event: Event, id: string) {
  if (store.id !== id) return;

  const color = (event.target as HTMLInputElement).value;
  sc.sendMessage({
    Action: ServerConnection.types.ChangeColor,
    Data: {
      Color: color,
      Player: store.id
    }
  });
}
</script>

<style lang="scss" scoped>
.user {
  align-items: center;
  padding: 7px;
  // border: 1px solid white;
  .user-color {
    width: 25px;
    border: 1px solid white;
    aspect-ratio: 1;
    border-radius: 50%;
  }

  &.active {
    border: 1px solid green;
  }
}
</style>