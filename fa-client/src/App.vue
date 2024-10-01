<script setup lang="ts">
import store from "./lib/store";

import Main from "./components/Main.vue";
import GameRoom from "./components/GameRoom.vue";
</script>

<template>
    <Main v-if="!store.inGame"></Main>
    <GameRoom v-else></GameRoom>
    <div class="absolute bottom-1 flex gap-3">
        <p>franconoronha</p>
        <a href="https://github.com/franconoronha" target="_blank">
            <img src="./assets/github.svg" alt="Github" height="20px">
        </a>
    </div>
</template>

<style scoped>

</style>
