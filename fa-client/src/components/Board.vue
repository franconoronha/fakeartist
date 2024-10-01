<template>
    <div id="canvas-area" @mouseenter="setOffset()">
        <!-- <h1 v-show="gameStarted">{{ hint }}</h1>
        <h2 v-if="!fakeArtist"> {{ currentWord }} </h2>
        <h2 v-else> Você é o artista falso </h2> -->
        <!-- DEBUG -->
        <button @click="reset">Reset</button>
        <canvas
            id="canvas"
            ref="canvas"
            @mousedown="holdMouse()"
            @mouseout="mousePressed = false"
            @mouseup="mousePressed = false"
            @mousemove="coordinates($event)"
        >
        </canvas>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
const canvas = ref<HTMLCanvasElement | null>(null);
let context: CanvasRenderingContext2D | null = null;
let mousePressed = false;
let drawerInterval = null;

const pos = {
    x: 0,
    y: 0
};

const offset = {
    x: 0,
    y: 0
};

const ultimaPos = {
    x: 0,
    y: 0
};

// const contextOptions = {
//     strokeStyle: null,
//     lineWidth: null,
// };

const movement = {
    x: 0,
    y: 0
};

function setOffset() {
    if (canvas.value) {
        let rect = canvas.value.getBoundingClientRect();
        offset.x = rect.left;
        offset.y = rect.top;
    }
}

function holdMouse() {
    mousePressed = true;
    ultimaPos.x = pos.x;
    ultimaPos.y = pos.y;
}

function coordinates(event: MouseEvent) {
    pos.x = event.clientX;
    pos.y = event.clientY;
    movement.x = event.movementX;
    movement.y = event.movementY;
}

function setupCanvas() {
    if (canvas.value) {
        context = canvas.value.getContext("2d");
        canvas.value.width = 800;
        canvas.value.height = 500;
        if (context) {
            context.lineCap = "round";
            context.strokeStyle = "white";
            context.lineWidth = 10;
        } else {
            console.error("Contexto não encontrado");
        }

        drawerInterval = setInterval(() => {
            drawer();
        }, 50);
    }
}

function reset() {
    if (canvas.value && context) {
        context.clearRect(0, 0, canvas.value.width, canvas.value.height);
    }
}

function drawer() {
    // && your_turn
    if (mousePressed) {
        // if (pos.x !== ultimaPos.x && pos.y !== ultimaPos.y
        if (true) {
            // $socket.client.emit("sendline", {
            //     from: {
            //         x: ultimaPos.x - offset.x,
            //         y: ultimaPos.y - offset.y
            //     },
            //     to: {
            //         x: pos.x - offset.x,
            //         y: pos.y - offset.y
            //     },
            //     color: color,
            // });

            if (context) {
                context.beginPath();
                const startX = ultimaPos.x - offset.x;
                const startY = ultimaPos.y - offset.y;
                const endX = pos.x - offset.x;
                const endY = pos.y - offset.y;
                context.moveTo(startX, startY);
                context.lineTo(endX, endY);
                context.stroke();
                console.log("draw");
            }

            ultimaPos.x = pos.x;
            ultimaPos.y = pos.y;
        }
    }
}

// function receive(from: Position, to: Position, color: string) {
//     if (context) {
//         context.strokeStyle = color;
//         context.beginPath();
//         context.moveTo(from.x, from.y);
//         context.lineTo(to.x, to.y);
//         context.stroke();
//     }
// }

//     sockets: {
//         gameStarted() {
//             this.setupCanvas();
//         },
//         drawline(data) {
//             this.receive(data.from, data.to, data.color);
//         },
//     }

onMounted(() => {
    setupCanvas();
});
</script>

<style scoped>
#canvas {
    outline: 1px solid red;
}
</style>